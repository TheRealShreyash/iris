import { z } from "zod";

export const clientRegisterPayloadModel = z.object({
  name: z.string(),
  applicationUrl: z.string(),
  redirectUri: z.string(),
});

export type ClientRegisterPayload = z.infer<typeof clientRegisterPayloadModel>;
