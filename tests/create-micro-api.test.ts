import { describe, expect, it, vi } from "vitest";
import { createMicroApi } from "../src";

describe("createMicroApi", () => {
  it("creates query and mutation endpoint definitions", () => {
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher: async () => new Response("{}"),
    });
    const users = api.resource("users", {
      list: api.get<unknown[]>("/users"),
      create: api.post<unknown, { name: string }>("/users"),
    });

    expect(users.list.baseKey()).toEqual(["main", "users", "list"]);
    expect(typeof users.list.fn()).toBe("function");
    expect(typeof users.create.fn).toBe("function");
  });

  it("extends an API client config with overrides", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ ok: true }), {
      headers: {
        "content-type": "application/json",
      },
    }));
    const uploadFetcher = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ uploaded: true }), {
      headers: {
        "content-type": "application/json",
      },
    }));
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher,
      headers: {
        "x-client": "web",
      },
    });
    const uploadApi = api.extend({
      name: "uploads",
      fetcher: uploadFetcher,
    });
    const uploads = uploadApi.resource("uploads", {
      avatar: uploadApi.post<{ uploaded: boolean }, { file: string }>("/avatar"),
      status: uploadApi.get<{ ok: boolean }>("/status"),
    });

    await expect(uploads.avatar.fn({ file: "avatar.png" })).resolves.toEqual({ uploaded: true });
    expect(uploadFetcher).toHaveBeenCalledOnce();
    expect(fetcher).not.toHaveBeenCalled();
    expect(new Headers(uploadFetcher.mock.calls[0]?.[1]?.headers).get("x-client")).toBe("web");
    expect(uploads.status.baseKey()).toEqual(["uploads", "uploads", "status"]);
  });
});
