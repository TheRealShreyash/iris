import type { Request } from "express";

export interface UserTokenPayload {
  id: string;
}

export interface EmailVerificationPayload {
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserTokenPayload;
  cookies: Record<string, string>;
}
