import { exportJWK, importSPKI } from "jose";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { db } from "../../../db";
import { authCodesTable, clientsTable, usersTable } from "../../../db/schema";
import { eq } from "drizzle-orm";
import ApiError from "../../common/utils/api-error";
import type { TokenRequestPayload, UserSigninPayload } from "./auth.models";
import { createAccessToken } from "./utils/token";

export const getJwks = async () => {
  const publicKey = readFileSync(process.env.PUBLIC_KEY_PATH!, "utf-8");

  const ecPublicKey = await importSPKI(publicKey, "RS256");
  const jwk = await exportJWK(ecPublicKey);
  const kid = createHash("sha256")
    .update(publicKey)
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

export const getAccessToken = async (payload: TokenRequestPayload) => {
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

  if (codeSelect.clientId !== clientId)
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
    exp: Math.floor(Date.now() / 1000) + 15 * 60,
    family_name: user.lastName ?? "",
    given_name: user.firstName,
    name: `${user.firstName} ${user.lastName ?? ""}`.trim(),
    picture: undefined, //hardcode for now
  });

  return { accessToken: accessToken };
};
