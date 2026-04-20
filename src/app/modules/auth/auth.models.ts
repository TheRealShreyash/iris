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

export const userSigninPayloadModel = z.object({
  email: z.email(),
  password: z.string(),
  clientId: z.string(),
  nonce: z.string().optional(),
});

export type UserTokenPayload = z.infer<typeof userTokenPayloadModel>;
export type UserSigninPayload = z.infer<typeof userSigninPayloadModel>;
