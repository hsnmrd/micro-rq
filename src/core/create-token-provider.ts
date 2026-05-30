import type { TokenProvider, TokenProviderConfig } from "./types";

export function createTokenProvider<TTokens = unknown>(
  config: TokenProviderConfig<TTokens>,
): TokenProvider<TTokens> {
  let refreshPromise: Promise<TTokens> | null = null;
  let refreshedAccessToken: string | null = null;

  const refreshAccessToken = async (): Promise<TTokens> => {
    if (!config.refresh) {
      throw new Error("Token refresh is not configured.");
    }

    if (!refreshPromise) {
      refreshPromise = runRefresh(config, (tokens) => {
        refreshedAccessToken = config.getAccessTokenFromRefreshResult?.(tokens) ?? refreshedAccessToken;
      }).finally(() => {
        refreshPromise = null;
      });
    }

    return refreshPromise;
  };

  return {
    getAccessToken: async () => refreshedAccessToken ?? config.getAccessToken(),
    refreshAccessToken,
    hasRefresh: () => Boolean(config.refresh),
  };
}

async function runRefresh<TTokens>(
  config: TokenProviderConfig<TTokens>,
  onTokens: (tokens: TTokens) => void,
): Promise<TTokens> {
  try {
    const refreshToken = await config.getRefreshToken?.();
    const tokens = await config.refresh?.({ refreshToken });

    if (tokens === undefined) {
      throw new Error("Token refresh returned no tokens.");
    }

    onTokens(tokens);
    await config.onRefreshSuccess?.(tokens);
    return tokens;
  } catch (error) {
    try {
      await config.onRefreshFailed?.(error);
    } catch {
      // Preserve the refresh failure as the request error.
    }
    throw error;
  }
}
