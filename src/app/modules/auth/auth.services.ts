import { exportJWK, importSPKI } from "jose";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { db } from "../../../db";
import { clientsTable } from "../../../db/schema";
import { eq } from "drizzle-orm";
import ApiError from "../../common/utils/api-error";

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
