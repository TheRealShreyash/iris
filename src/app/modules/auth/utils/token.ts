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
    issuer: "iris-auth",
    keyid: kid,
  });
}

export function verifyAccessToken(token: string) {
  return JWT.verify(token, PUBLIC_KEY, {
    algorithms: ["RS256"],
  }) as UserTokenPayload;
}
