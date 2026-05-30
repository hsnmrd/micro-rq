import { describe, expect, it, vi } from "vitest";
import { createTokenProvider } from "../src";

describe("createTokenProvider", () => {
  it("returns access tokens and coordinates refresh callbacks", async () => {
    const onRefreshSuccess = vi.fn();
    const provider = createTokenProvider({
      getAccessToken: () => "old-token",
      getRefreshToken: () => "refresh-token",
      refresh: async ({ refreshToken }) => ({ accessToken: "new-token", refreshToken }),
      getAccessTokenFromRefreshResult: (tokens) => tokens.accessToken,
      onRefreshSuccess,
    });

    expect(await provider.getAccessToken()).toBe("old-token");
    await expect(provider.refreshAccessToken()).resolves.toEqual({
      accessToken: "new-token",
      refreshToken: "refresh-token",
    });
    expect(await provider.getAccessToken()).toBe("new-token");
    expect(onRefreshSuccess).toHaveBeenCalledOnce();
  });

  it("calls onRefreshFailed when refresh fails", async () => {
    const onRefreshFailed = vi.fn();
    const error = new Error("nope");
    const provider = createTokenProvider({
      getAccessToken: () => null,
      refresh: async () => {
        throw error;
      },
      onRefreshFailed,
    });

    await expect(provider.refreshAccessToken()).rejects.toBe(error);
    expect(onRefreshFailed).toHaveBeenCalledWith(error);
  });
});
