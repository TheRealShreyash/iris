import JWT from "jsonwebtoken";
import { readFileSync } from "node:fs";
import type { UserTokenPayload } from "../../../common/utils/interfaces";
import { createHash } from "node:crypto";

const privateKey = readFileSync(process.env.PRIVATE_KEY_PATH!, "utf-8");
const publicKey = readFileSync(process.env.PUBLIC_KEY_PATH!, "utf-8");

export function createAccessToken(payload: UserTokenPayload) {
  const kid = createHash("sha256")
    .update(publicKey)
    .digest("hex")
    .substring(0, 16);
  return JWT.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "15m",
    issuer: "iris-auth",
    keyid: kid,
  });
}
