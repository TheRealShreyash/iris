import { z } from "zod";

export const userTokenPayloadModel = z.object({
  iss: z.string(),
  sub: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  family_name: z.string(),
  given_name: z.string(),
  name: z.string(),
  picture: z.string().optional(),
});

export const userSigninPayloadModel = z.object({
  email: z.email(),
  password: z.string(),
  clientId: z.string(),
  nonce: z.string().optional(),
});

export const userSignupPayloadModel = z.object({
  firstName: z.string(),
  lastName: z.string().optional(),
  email: z.string(),
  password: z.string(),
});

export const tokenRequestModel = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  code: z.string(),
});

export const refreshTokenModel = z.object({
  refreshToken: z.string(),
});

export type UserTokenPayload = z.infer<typeof userTokenPayloadModel>;
export type UserSigninPayload = z.infer<typeof userSigninPayloadModel>;
export type TokenRequestPayload = z.infer<typeof tokenRequestModel>;
export type UserSignupPayload = z.infer<typeof userSignupPayloadModel>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenModel>;
