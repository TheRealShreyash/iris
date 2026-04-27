import { exportJWK, importSPKI } from "jose";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { db } from "../../../db";
import { authCodesTable, clientsTable, usersTable } from "../../../db/schema";
import { eq } from "drizzle-orm";
import ApiError from "../../common/utils/api-error";
import type {
  TokenRequestPayload,
  UserSigninPayload,
  UserSignupPayload,
} from "./auth.models";
import {
  createAccessToken,
  createEmailVerificationToken,
  createRefreshToken,
  verifyEmailVerificationToken,
} from "./utils/token";
import { PUBLIC_KEY } from "../../../certs/keys";
import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

export const getJwks = async () => {
  const ecPublicKey = await importSPKI(PUBLIC_KEY, "RS256");
  const jwk = await exportJWK(ecPublicKey);
  const kid = createHash("sha256")
    .update(PUBLIC_KEY)
    .digest("hex")
    .substring(0, 16);
  const jwks = [
    {
      ...jwk,
      kid: kid,
      use: "sig",
      alg: "RS256",
      kty: "RSA",
    },
  ];

  return jwks;
};

export const clientExists = async (clientId: string) => {
  const [existing] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.clientId, clientId))
    .limit(1);

  if (!existing) throw ApiError.badRequest("Client does not exist");

  return true;
};

export const signin = async (payload: UserSigninPayload) => {
  const { email, password, clientId, nonce } = payload;

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!existing)
    throw ApiError.notFound(`User with email ${email} does not exist`);

  const salt = existing.salt!;
  const hash = createHmac("sha256", salt).update(password).digest("hex");

  if (existing.password !== hash) {
    throw ApiError.badRequest("Email or password is incorrect");
  }

  const code = randomBytes(32).toString("base64url");

  const [client] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.clientId, clientId))
    .limit(1);

  if (!client) throw ApiError.notFound("Client doesn't exist");

  await db.insert(authCodesTable).values({
    code,
    userId: existing.id,
    clientId: client.id,
    nonce: nonce,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  return { code: code, redirectUri: client.redirectUri };
};

export const signup = async (payload: UserSignupPayload) => {
  const { firstName, lastName, email, password } = payload;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (user)
    throw ApiError.badRequest(`User with email ${email} already exists`);

  const salt = randomBytes(32).toString("hex");
  const hash = createHmac("sha256", salt).update(password).digest("hex");

  const [result] = await db
    .insert(usersTable)
    .values({
      firstName,
      lastName,
      email,
      password: hash,
      salt,
    })
    .returning({ id: usersTable.id });

  const verificationToken = createEmailVerificationToken({
    id: result?.id as string,
  });
  const verificationLink = `${process.env.ISSUER}/auth/verify-email?token=${verificationToken}`;

  await sendVerificationEmail(email, verificationLink);

  return result;
};

export const getTokens = async (payload: TokenRequestPayload) => {
  const { clientId, clientSecret, code } = payload;

  const [client] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.clientId, clientId))
    .limit(1);

  if (!client) throw ApiError.notFound("Client doesn't exist");

  const hash = createHash("sha256").update(clientSecret).digest("hex");

  if (hash !== client.clientSecret)
    throw ApiError.unauthorized("Invalid client secret");

  const [codeSelect] = await db
    .select()
    .from(authCodesTable)
    .where(eq(authCodesTable.code, code))
    .limit(1);

  if (!codeSelect) throw ApiError.badRequest("Incorrect code");

  if (codeSelect.clientId !== client.id)
    throw ApiError.unauthorized("Code was not issued for this client");

  if (codeSelect.expiresAt < new Date())
    throw ApiError.badRequest("Code has expired");

  await db.delete(authCodesTable).where(eq(authCodesTable.code, code));

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, codeSelect.userId))
    .limit(1);

  if (!user) throw ApiError.notFound("User not found");

  const ISSUER = process.env.ISSUER || "http://localhost:8080";

  const accessToken = createAccessToken({
    iss: ISSUER,
    sub: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    family_name: user.lastName ?? "",
    given_name: user.firstName,
    name: `${user.firstName} ${user.lastName ?? ""}`.trim(),
    picture: undefined, //hardcode for now
  });

  const refreshToken = createRefreshToken({ id: user.id });
  const hashedRefreshToken = createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await db
    .update(usersTable)
    .set({ refreshToken: hashedRefreshToken })
    .where(eq(usersTable.id, user.id));

  return { accessToken: accessToken, refreshToken: refreshToken };
};

export const refreshTokens = async (refreshToken: string) => {
  if (!refreshToken) throw ApiError.badRequest("No refresh token was sent");

  const hash = createHash("sha256")
    .update(refreshToken as any)
    .digest("hex");

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.refreshToken, hash))
    .limit(1);

  if (!user) throw ApiError.unauthorized("Invalid refresh token");

  const newRefreshToken = createRefreshToken({ id: user.id });
  const ISSUER = process.env.ISSUER || "http://localhost:8080";
  const accessToken = createAccessToken({
    iss: ISSUER,
    sub: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    family_name: user.lastName ?? "",
    given_name: user.firstName,
    name: `${user.firstName} ${user.lastName ?? ""}`.trim(),
    picture: undefined, //hardcode for now
  });

  const newHash = createHash("sha256")
    .update(refreshToken as any)
    .digest("hex");

  await db
    .update(usersTable)
    .set({ refreshToken: newHash })
    .where(eq(usersTable.id, user.id));

  return { accessToken, refreshToken: newRefreshToken };
};

export const logout = async (userId: string) => {
  await db
    .update(usersTable)
    .set({ refreshToken: null })
    .where(eq(usersTable.id, userId));
};

export const getClientMetadata = async (clientId: string) => {
  if (!clientId) throw ApiError.badRequest("No client id provided");

  const [client] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.clientId, clientId))
    .limit(1);

  return { name: client?.name, applicationUrl: client?.applicationUrl };
};

export const resendVerificationEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (user?.emailVerified)
    throw ApiError.badRequest("Email is already verified");

  const verificationToken = createEmailVerificationToken({
    id: user?.id as string,
  });
  const verificationLink = `${process.env.ISSUER}/auth/verify-email?token=${verificationToken}`;

  await sendVerificationEmail(email, verificationLink);
  return;
};

export const verifyEmail = async (token: string) => {
  const payload = verifyEmailVerificationToken(token);

  if (!payload) throw ApiError.badRequest("Invalid or expired link");

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, payload.id));

  if (!user) throw ApiError.notFound("User with that email doesn't exist");

  if (user.emailVerified)
    throw ApiError.badRequest("Email is already verified");

  await db
    .update(usersTable)
    .set({ emailVerified: true })
    .where(eq(usersTable.id, user.id));

  return;
};

export const sendVerificationEmail = async (email: string, link: string) => {
  if (!email) throw ApiError.badRequest("No email provided");

  const TOKEN = process.env.SMTP_TOKEN;

  const transport = nodemailer.createTransport(
    MailtrapTransport({
      token: TOKEN as string,
    }),
  );

  const sender = {
    address: "verifyemail@shreyxsh.me",
    name: "Verify Email | Iris",
  };

  const recipents = [email];

  await transport.sendMail({
    from: sender,
    to: recipents,
    subject: "Verify Your Email",
    html: `<a href=${link}>Click here to verify</a>`,
  });
};
