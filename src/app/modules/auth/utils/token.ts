import JWT from "jsonwebtoken";
import { createHash } from "node:crypto";
import type { UserTokenPayload } from "../auth.models";
import { PRIVATE_KEY, PUBLIC_KEY } from "../../../../certs/keys";

export function createAccessToken(payload: UserTokenPayload) {
  const kid = createHash("sha256")
    .update(PUBLIC_KEY)
    .digest("hex")
    .substring(0, 16);
  return JWT.sign(payload, PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: "15m",
    keyid: kid,
  });
}

export function createRefreshToken(payload: { id: string }) {
  const kid = createHash("sha256")
    .update(PUBLIC_KEY)
    .digest("hex")
    .substring(0, 16);
  return JWT.sign(payload, PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: "24h",
    keyid: kid,
  });
}

export function createEmailVerificationToken(payload: { id: string }) {
  return JWT.sign(payload, process.env.JWT_EMAIL_VERIFICATION_SECRET!, {
    expiresIn: "24h",
  });
}

export function verifyEmailVerificationToken(token: string) {
  return JWT.verify(token, process.env.JWT_EMAIL_VERIFICATION_SECRET!) as {
    id: string;
  };
}

export function verifyAccessToken(token: string) {
  return JWT.verify(token, PUBLIC_KEY, {
    algorithms: ["RS256"],
  }) as UserTokenPayload;
}

export function verifyRefreshToken(token: string) {
  return JWT.verify(token, PUBLIC_KEY, {
    algorithms: ["RS256"],
  }) as { id: string };
}
