import type { TokenProvider, TokenProviderConfig } from "./types";

export function createTokenProvider<TTokens = unknown>(
  config: TokenProviderConfig<TTokens>,
): TokenProvider<TTokens> {
  let refreshPromise: Promise<TTokens> | null = null;
  let refreshedAccessToken: string | null = null;

  const refreshAccessToken = async (): Promise<TTokens> => {
    const refreshConfig = getRefreshConfig(config);

    if (!refreshConfig) {
      throw new Error("Token refresh is not configured.");
    }

    if (!refreshPromise) {
      refreshPromise = runRefresh(config, (tokens) => {
        refreshedAccessToken = refreshConfig.selectAccessToken?.(tokens) ?? refreshedAccessToken;
      }).finally(() => {
        refreshPromise = null;
      });
    }

    return refreshPromise;
  };

  return {
    getAccessToken: async () => refreshedAccessToken ?? config.getAccessToken(),
    refreshAccessToken,
    hasRefresh: () => Boolean(getRefreshConfig(config)),
  };
}

async function runRefresh<TTokens>(
  config: TokenProviderConfig<TTokens>,
  onTokens: (tokens: TTokens) => void,
): Promise<TTokens> {
  const refreshConfig = getRefreshConfig(config);

  if (!refreshConfig) {
    throw new Error("Token refresh is not configured.");
  }

  try {
    const refreshToken = await config.getRefreshToken?.();
    const tokens = await refreshConfig.fn({ refreshToken });

    if (tokens === undefined) {
      throw new Error("Token refresh returned no tokens.");
    }

    onTokens(tokens);
    await refreshConfig.onSuccess?.(tokens);
    return tokens;
  } catch (error) {
    try {
      await refreshConfig.onError?.(error);
    } catch {
      // Preserve the refresh failure as the request error.
    }
    throw error;
  }
}

function getRefreshConfig<TTokens>(config: TokenProviderConfig<TTokens>) {
  return config.refresh;
}
