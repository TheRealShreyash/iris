import { exportJWK, importSPKI } from "jose";
import { readFileSync } from "node:fs";

export const getJwks = async () => {
  const publicKeyPem = readFileSync(process.env.PUBLIC_KEY_PATH!, "utf-8");

  const ecPublicKey = await importSPKI(publicKeyPem, "RS256");
  const jwk = await exportJWK(ecPublicKey);
  const jwks = [
    {
      ...jwk,
      kid: "iris_main_key",
      use: "sig",
      alg: "RS256",
      kty: "RSA",
    },
  ];

  return jwks;
};
