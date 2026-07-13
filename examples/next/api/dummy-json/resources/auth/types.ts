import type { AuthTokens } from "../../token-provider";

export type LoginDto = {
  username: string;
  password: string;
  expiresInMins?: number;
};

export type RefreshDto = {
  refreshToken?: string | null;
  expiresInMins?: number;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  role?: string;
};

export type LoginResponse = AuthTokens & AuthUser;
