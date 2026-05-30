import type { AuthTokens } from "../../client/token-provider";

export type LoginDto = {
  username: string;
  password: string;
};

export type RefreshDto = {
  refreshToken?: string | null;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type LoginResponse = AuthTokens & AuthUser;
