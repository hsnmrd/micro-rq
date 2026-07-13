import { apiDummy, publicApiDummy } from "../..";
import type { AuthTokens } from "../../token-provider";
import type { AuthUser, LoginDto, LoginResponse, RefreshDto } from "./types";

export const auth = publicApiDummy.resource("auth", {
  login: publicApiDummy.post<LoginResponse, LoginDto>("/auth/login", {
    authMode: "none",
  }),
  refresh: publicApiDummy.post<AuthTokens, RefreshDto>("/auth/refresh", {
    authMode: "none",
  }),
});

export const authenticatedAuth = apiDummy.resource("auth", {
  me: apiDummy.get<AuthUser>("/auth/me", {
    authMode: "required",
  }),
  meOptional: apiDummy.get<AuthUser>("/auth/me"),
});

export type { AuthUser, LoginDto, LoginResponse, RefreshDto } from "./types";
