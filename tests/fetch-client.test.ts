import { describe, expect, it, vi } from "vitest";
import { createMicroApi, createTokenProvider, MicroApiError, MicroAuthRequiredError } from "../src";

function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
    ...init,
  });
}

describe("fetch client", () => {
  it("performs a static path GET request", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse([{ id: "1" }]));
    const api = createMicroApi({ name: "main", baseUrl: "https://api.example.com", fetcher });
    const users = api.resource("users", {
      list: api.get<Array<{ id: string }>>("/users"),
    });

    await expect(users.list.fn()()).resolves.toEqual([{ id: "1" }]);
    expect(fetcher).toHaveBeenCalledWith("https://api.example.com/users", expect.objectContaining({ method: "GET" }));
  });

  it("performs a dynamic path GET request", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ id: "1" }));
    const api = createMicroApi({ name: "main", baseUrl: "https://api.example.com", fetcher });
    const users = api.resource("users", {
      detail: api.get<{ id: string }, string>((id) => `/users/${id}`),
    });

    await users.detail.fn("1")();
    expect(fetcher).toHaveBeenCalledWith("https://api.example.com/users/1", expect.any(Object));
  });

  it("serializes query params", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse([]));
    const api = createMicroApi({ name: "main", baseUrl: "/api", fetcher });
    const users = api.resource("users", {
      list: api.get<unknown[], { page: number; tags: string[]; skip?: string; meta: { a: number }; empty: null }>(
        "/users",
        {
          query: (params) => params,
        },
      ),
    });

    await users.list.fn({ page: 1, tags: ["a", "b"], meta: { a: 1 }, empty: null })();

    expect(fetcher).toHaveBeenCalledWith(
      '/api/users?page=1&tags=a&tags=b&meta=%7B%22a%22%3A1%7D&empty=null',
      expect.any(Object),
    );
  });

  it("serializes POST body variables by default", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ id: "1" }));
    const api = createMicroApi({ name: "main", baseUrl: "/api", fetcher });
    const users = api.resource("users", {
      create: api.post<{ id: string }, { name: string }>("/users"),
    });

    await users.create.fn({ name: "John" });

    const init = fetcher.mock.calls[0]?.[1];
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify({ name: "John" }));
    expect(new Headers(init?.headers).get("content-type")).toBe("application/json");
  });

  it("passes FormData bodies without forcing JSON content-type", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ url: "/files/avatar.png" }));
    const api = createMicroApi({ name: "main", baseUrl: "/api", fetcher });
    const files = api.resource("files", {
      upload: api.post<{ url: string }, { file: Blob; filename: string }>("/files", {
        body: ({ file, filename }) => {
          const formData = new FormData();
          formData.append("file", file, filename);
          return formData;
        },
      }),
    });
    const file = new Blob(["hello"], { type: "text/plain" });

    await files.upload.fn({ file, filename: "hello.txt" });

    const init = fetcher.mock.calls[0]?.[1];
    expect(init?.body).toBeInstanceOf(FormData);
    expect(new Headers(init?.headers).get("content-type")).toBeNull();
  });

  it("converts plain objects to FormData when bodyType is form-data", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ url: "/files/avatar.png" }));
    const api = createMicroApi({ name: "main", baseUrl: "/api", fetcher });
    const files = api.resource("files", {
      upload: api.post<{ url: string }, { file: Blob; filename: string; tags: string[]; meta: { kind: string } }>("/files", {
        bodyType: "form-data",
        body: ({ file, filename, tags, meta }) => ({
          file,
          filename,
          tags,
          meta,
        }),
      }),
    });
    const file = new Blob(["hello"], { type: "text/plain" });

    await files.upload.fn({
      file,
      filename: "hello.txt",
      tags: ["a", "b"],
      meta: { kind: "avatar" },
    });

    const init = fetcher.mock.calls[0]?.[1];
    const formData = init?.body;

    expect(formData).toBeInstanceOf(FormData);
    expect(new Headers(init?.headers).get("content-type")).toBeNull();
    expect((formData as FormData).get("filename")).toBe("hello.txt");
    expect((formData as FormData).getAll("tags")).toEqual(["a", "b"]);
    expect((formData as FormData).get("meta")).toBe(JSON.stringify({ kind: "avatar" }));
  });

  it("merges custom headers", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: true }));
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher,
      headers: () => ({ "X-App-Name": "test" }),
    });
    const users = api.resource("users", {
      update: api.patch<{ ok: boolean }, { id: string; body: { name: string } }>(
        ({ id }) => `/users/${id}`,
        {
          body: ({ body }) => body,
          headers: () => ({ "X-Endpoint": "update" }),
        },
      ),
    });

    await users.update.fn({ id: "1", body: { name: "Jane" } });

    const headers = new Headers(fetcher.mock.calls[0]?.[1]?.headers);
    expect(headers.get("x-app-name")).toBe("test");
    expect(headers.get("x-endpoint")).toBe("update");
  });

  it("injects auth headers", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ id: "1" }));
    const tokenProvider = createTokenProvider({ getAccessToken: () => "abc" });
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher,
      tokenProvider,
      authHeader: (token) => ({ Authorization: `Bearer ${token}` }),
    });
    const users = api.resource("users", {
      detail: api.get<{ id: string }, string>((id) => `/users/${id}`),
    });

    await users.detail.fn("1")();

    expect(new Headers(fetcher.mock.calls[0]?.[1]?.headers).get("authorization")).toBe("Bearer abc");
  });

  it("skips auth headers when endpoint authMode is none", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: true }));
    const getAccessToken = vi.fn().mockResolvedValue("abc");
    const tokenProvider = createTokenProvider({ getAccessToken });
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher,
      tokenProvider,
      authHeader: (token) => ({ Authorization: `Bearer ${token}` }),
    });
    const auth = api.resource("auth", {
      login: api.post<{ ok: boolean }, { username: string }>("/auth/login", {
        authMode: "none",
      }),
    });

    await auth.login.fn({ username: "emilys" });

    expect(getAccessToken).not.toHaveBeenCalled();
    expect(new Headers(fetcher.mock.calls[0]?.[1]?.headers).get("authorization")).toBeNull();
  });

  it("does not refresh 401 responses when endpoint authMode is none", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ message: "bad login" }, { status: 401, statusText: "Unauthorized" }));
    const refresh = vi.fn().mockResolvedValue({ accessToken: "new-token" });
    const tokenProvider = createTokenProvider({
      getAccessToken: () => "old-token",
      refresh: {
        fn: refresh,
      },
    });
    const api = createMicroApi({ name: "main", baseUrl: "/api", fetcher, tokenProvider });
    const auth = api.resource("auth", {
      login: api.post<unknown, { username: string }>("/auth/login", {
        authMode: "none",
      }),
    });

    await expect(auth.login.fn({ username: "bad" })).rejects.toMatchObject({
      status: 401,
    });
    expect(refresh).not.toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("throws before fetch when endpoint authMode is required and no token exists", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: true }));
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher,
      tokenProvider: createTokenProvider({
        getAccessToken: () => null,
      }),
    });
    const auth = api.resource("auth", {
      me: api.get<{ ok: boolean }>("/auth/me", {
        authMode: "required",
      }),
    });

    await expect(auth.me.fn()()).rejects.toBeInstanceOf(MicroAuthRequiredError);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("calls onError with request context for failed responses", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ code: "bad" }, { status: 400, statusText: "Bad Request" }));
    const onError = vi.fn();
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher,
      onError,
    });
    const users = api.resource("users", {
      list: api.get<unknown[], { page: number }>("/users", {
        query: (params) => params,
      }),
    });

    await expect(users.list.fn({ page: 1 })()).rejects.toBeInstanceOf(MicroApiError);

    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
      }),
      {
        method: "GET",
        path: "/users",
        url: "/api/users?page=1",
        authMode: "optional",
      },
    );
  });

  it("calls onError for auth required errors", async () => {
    const onError = vi.fn();
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher: vi.fn<typeof fetch>(),
      tokenProvider: createTokenProvider({
        getAccessToken: () => null,
      }),
      onError,
    });
    const auth = api.resource("auth", {
      me: api.get<{ ok: boolean }>("/auth/me", {
        authMode: "required",
      }),
    });

    await expect(auth.me.fn()()).rejects.toBeInstanceOf(MicroAuthRequiredError);

    expect(onError).toHaveBeenCalledWith(expect.any(MicroAuthRequiredError), {
      method: "GET",
      path: "/auth/me",
      url: "/api/auth/me",
      authMode: "required",
    });
  });

  it("preserves the original request error when onError throws", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ code: "bad" }, { status: 500, statusText: "Server Error" }));
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher,
      onError: () => {
        throw new Error("handler failed");
      },
    });
    const users = api.resource("users", {
      list: api.get<unknown[]>("/users"),
    });

    await expect(users.list.fn()()).rejects.toMatchObject({
      name: "MicroApiError",
      status: 500,
    });
  });

  it("refreshes on 401 and retries once", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: "expired" }, { status: 401, statusText: "Unauthorized" }))
      .mockResolvedValueOnce(jsonResponse({ id: "1" }));
    const refresh = vi.fn().mockResolvedValue({ accessToken: "new-token" });
    const tokenProvider = createTokenProvider({
      getAccessToken: () => "old-token",
      refresh: {
        fn: refresh,
        selectAccessToken: (tokens: { accessToken: string }) => tokens.accessToken,
      },
    });
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher,
      tokenProvider,
      authHeader: (token) => ({ Authorization: `Bearer ${token}` }),
    });
    const users = api.resource("users", {
      detail: api.get<{ id: string }, string>((id) => `/users/${id}`),
    });

    await expect(users.detail.fn("1")()).resolves.toEqual({ id: "1" });

    expect(refresh).toHaveBeenCalledOnce();
    expect(new Headers(fetcher.mock.calls[1]?.[1]?.headers).get("authorization")).toBe("Bearer new-token");
  });

  it("runs only one refresh during parallel 401 responses", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: "expired" }, { status: 401, statusText: "Unauthorized" }))
      .mockResolvedValueOnce(jsonResponse({ message: "expired" }, { status: 401, statusText: "Unauthorized" }))
      .mockResolvedValueOnce(jsonResponse({ id: "1" }))
      .mockResolvedValueOnce(jsonResponse({ id: "2" }));
    let resolveRefresh: (value: { accessToken: string }) => void = () => undefined;
    const refresh = vi.fn(
      () =>
        new Promise<{ accessToken: string }>((resolve) => {
          resolveRefresh = resolve;
        }),
    );
    const tokenProvider = createTokenProvider({
      getAccessToken: () => "old-token",
      refresh: {
        fn: refresh,
        selectAccessToken: (tokens) => tokens.accessToken,
      },
    });
    const api = createMicroApi({ name: "main", baseUrl: "/api", fetcher, tokenProvider });
    const users = api.resource("users", {
      detail: api.get<{ id: string }, string>((id) => `/users/${id}`),
    });

    const first = users.detail.fn("1")();
    const second = users.detail.fn("2")();

    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    resolveRefresh({ accessToken: "new-token" });

    await expect(Promise.all([first, second])).resolves.toEqual([{ id: "1" }, { id: "2" }]);
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("throws MicroApiError for failed responses", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ code: "bad" }, { status: 400, statusText: "Bad Request" }));
    const api = createMicroApi({ name: "main", baseUrl: "/api", fetcher });
    const users = api.resource("users", {
      list: api.get<unknown[]>("/users"),
    });

    await expect(users.list.fn()()).rejects.toMatchObject({
      name: "MicroApiError",
      status: 400,
      data: { code: "bad" },
    } satisfies Partial<MicroApiError>);
  });

  it("handles empty response bodies", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    const api = createMicroApi({ name: "main", baseUrl: "/api", fetcher });
    const users = api.resource("users", {
      remove: api.delete<void, string>((id) => `/users/${id}`),
    });

    await expect(users.remove.fn("1")).resolves.toBeUndefined();
  });
});
