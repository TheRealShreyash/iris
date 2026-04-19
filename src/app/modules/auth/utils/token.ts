import JWT from "jsonwebtoken";
import { readFileSync } from "node:fs";
import type { UserTokenPayload } from "../../../common/utils/interfaces";

const privateKey = readFileSync(process.env.PRIVATE_KEY_PATH!, "utf-8");

export function createAccessToken(payload: UserTokenPayload) {
  return JWT.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "15m",
    issuer: "iris-auth",
  });
}
