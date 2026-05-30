import { describe, expect, it } from "vitest";
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
});
