export interface UserTokenPayload {
  iss: string;
  sub: string;
  email: string;
  emailVerified: string;
  exp: number;
  family_name?: string;
  given_name?: string;
  name?: string;
  picture?: string;
}

export interface ClientPayload {
  name?: string;
  applicationUrl?: string;
  redirectUri?: string;
}
