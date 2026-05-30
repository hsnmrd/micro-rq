import { describe, expect, it } from "vitest";
import { createMicroApi } from "../src";

describe("query keys", () => {
  it("returns base and full keys", () => {
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher: async () => new Response("[]", { headers: { "content-type": "application/json" } }),
    });
    const users = api.resource("users", {
      list: api.get<unknown[], { page: number }>("/users", {
        query: (params) => params,
      }),
      detail: api.get<unknown, string>((id) => `/users/${id}`),
    });

    expect(users.list.baseKey()).toEqual(["main", "users", "list"]);
    expect(users.list.key({ page: 1 })).toEqual(["main", "users", "list", { page: 1 }]);
    expect(users.detail.key("user-1")).toEqual(["main", "users", "detail", "user-1"]);
  });

  it("does not collide across APIs", () => {
    const fetcher = async () => new Response("[]", { headers: { "content-type": "application/json" } });
    const mainApi = createMicroApi({ name: "main", baseUrl: "/api", fetcher });
    const paymentApi = createMicroApi({ name: "payment", baseUrl: "/payment-api", fetcher });
    const users = mainApi.resource("users", { list: mainApi.get<unknown[]>("/users") });
    const paymentUsers = paymentApi.resource("users", { list: paymentApi.get<unknown[]>("/users") });

    expect(users.list.key()).toEqual(["main", "users", "list"]);
    expect(paymentUsers.list.key()).toEqual(["payment", "users", "list"]);
  });
});
