import { apiDummy } from "../..";
import type { AuthTokens } from "../../token-provider";
import type { AuthUser, LoginDto, LoginResponse, RefreshDto } from "./types";

export const auth = apiDummy.resource("auth", {
  me: apiDummy.get<AuthUser>("/auth/me", {
    authMode: "required",
  }),
  meOptional: apiDummy.get<AuthUser>("/auth/me"),
  login: apiDummy.post<LoginResponse, LoginDto>("/auth/login", {
    authMode: "none",
  }),
  refresh: apiDummy.post<AuthTokens, RefreshDto>("/auth/refresh", {
    authMode: "none",
  }),
});

export type { AuthUser, LoginDto, LoginResponse, RefreshDto } from "./types";
