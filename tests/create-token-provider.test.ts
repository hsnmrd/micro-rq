import { describe, expect, it, vi } from "vitest";
import { createTokenProvider } from "../src";

describe("createTokenProvider", () => {
  it("returns access tokens and coordinates refresh callbacks", async () => {
    const onSuccess = vi.fn();
    const provider = createTokenProvider({
      getAccessToken: () => "old-token",
      getRefreshToken: () => "refresh-token",
      refresh: {
        fn: async ({ refreshToken }) => ({ accessToken: "new-token", refreshToken }),
        selectAccessToken: (tokens) => tokens.accessToken,
        onSuccess,
      },
    });

    expect(await provider.getAccessToken()).toBe("old-token");
    await expect(provider.refreshAccessToken()).resolves.toEqual({
      accessToken: "new-token",
      refreshToken: "refresh-token",
    });
    expect(await provider.getAccessToken()).toBe("new-token");
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("calls onError when refresh fails", async () => {
    const onError = vi.fn();
    const error = new Error("nope");
    const provider = createTokenProvider({
      getAccessToken: () => null,
      refresh: {
        fn: async () => {
          throw error;
        },
        onError,
      },
    });

    await expect(provider.refreshAccessToken()).rejects.toBe(error);
    expect(onError).toHaveBeenCalledWith(error);
  });
});
