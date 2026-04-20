import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { clientsTable } from "../../../db/schema";
import ApiError from "../../common/utils/api-error";
import { randomBytes, createHmac } from "node:crypto";
import type { ClientRegisterPayload } from "./admin.models";

export const registerClient = async (payload: ClientRegisterPayload) => {
  const { name, applicationUrl, redirectUri } = payload;

  if (!name || !applicationUrl || !redirectUri)
    throw ApiError.badRequest("Missing required fields");

  const clientResult = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.applicationUrl, applicationUrl));

  if (clientResult.length > 0)
    throw ApiError.conflict("Client with that application url exists.");

  const clientId = randomBytes(32).toString("hex");
  const clientSecret = randomBytes(32).toString("hex");
  const salt = randomBytes(16).toString("hex");

  const hashedSecret = createHmac("sha256", salt)
    .update(clientSecret)
    .digest("hex");

  const [result] = await db
    .insert(clientsTable)
    .values({
      name,
      applicationUrl,
      clientId,
      clientSecret: hashedSecret,
      salt: salt,
      redirectUri,
    })
    .returning({ clientId: clientsTable.clientId });

  return { ...result, clientSecret: clientSecret };
};
