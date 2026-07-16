import { createTokenProvider } from "micro-rq";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const accessTokenKey = "dummy_access_token";
export const refreshTokenKey = "dummy_refresh_token";

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=604800; samesite=lax`;
}

function removeCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function hasAccessToken() {
  return Boolean(readCookie(accessTokenKey));
}

export function saveTokens(tokens: AuthTokens) {
  writeCookie(accessTokenKey, tokens.accessToken);
  writeCookie(refreshTokenKey, tokens.refreshToken);
}

export function clearTokens() {
  removeCookie(accessTokenKey);
  removeCookie(refreshTokenKey);
}

export const tokenProvider = createTokenProvider<AuthTokens>({
  getAccessToken: () => readCookie(accessTokenKey),
  getRefreshToken: () => readCookie(refreshTokenKey),
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
