import { createTokenProvider } from "micro-rq";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const authProvider = createTokenProvider({
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  refresh: async ({ refreshToken }) => {
    const { auth } = await import("../resources/auth/auth.resource");

    return auth.refresh.fn({ refreshToken });
  },
  getAccessTokenFromRefreshResult: (tokens) => tokens.accessToken,
  onRefreshSuccess: (tokens) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  },
  onRefreshFailed: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
});
