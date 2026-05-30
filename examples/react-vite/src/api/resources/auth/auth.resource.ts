import { api } from "../../client/api";
import type { AuthTokens } from "../../client/token-provider";
import type { AuthUser, LoginDto, LoginResponse, RefreshDto } from "./auth.types";

export const auth = api.resource("auth", {
  login: api.post<LoginResponse, LoginDto>("/auth/login", {
    authMode: "none",
    body: (credentials) => ({
      ...credentials,
      expiresInMins: 1,
    }),
  }),
  refresh: api.post<AuthTokens, RefreshDto>("/auth/refresh", {
    authMode: "none",
    body: ({ refreshToken }) => ({
      refreshToken,
      expiresInMins: 30,
    }),
  }),
  me: api.get<AuthUser>("/auth/me", {
    authMode: "required",
  }),
});
