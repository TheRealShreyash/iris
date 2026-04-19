import { exportJWK, importSPKI } from "jose";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

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
