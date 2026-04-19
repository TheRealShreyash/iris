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

export interface ClientPayload {
  name?: string;
  applicationUrl?: string;
  redirectUri?: string;
}
