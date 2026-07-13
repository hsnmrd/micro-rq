import { createTokenProvider } from "tanstack-rest-query";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const accessTokenKey = "accessToken";
const refreshTokenKey = "refreshToken";

function readToken(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(key);
}

export function saveTokens(tokens: AuthTokens) {
  localStorage.setItem(accessTokenKey, tokens.accessToken);
  localStorage.setItem(refreshTokenKey, tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
}

export const tokenProvider = createTokenProvider<AuthTokens>({
  getAccessToken: () => readToken(accessTokenKey),
  getRefreshToken: () => readToken(refreshTokenKey),
  refresh: {
    fn: async ({ refreshToken }) => {
      const { auth } = await import("./resources/auth");

      return auth.refresh.fn({ refreshToken });
    },
    selectAccessToken: (tokens) => tokens.accessToken,
    onSuccess: saveTokens,
    onError: clearTokens,
  },
});
