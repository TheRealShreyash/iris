import { z } from "zod";

export const userTokenPayloadModel = z.object({
  iss: z.string(),
  sub: z.string(),
  email: z.string(),
  emailVerified: z.string(),
  exp: z.number(),
  family_name: z.string(),
  given_name: z.string(),
  name: z.string(),
  picture: z.string(),
});

export type UserTokenPayload = z.infer<typeof userTokenPayloadModel>;
