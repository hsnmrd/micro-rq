import { describe, expect, it } from "vitest";
import { createMicroApi } from "../src";

describe("resource endpoints", () => {
  it("query build returns only queryKey and queryFn", () => {
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher: async () => new Response("{}"),
    });
    const users = api.resource("users", {
      detail: api.get<{ id: string }, string>((id) => `/users/${id}`),
    });

    expect(Object.keys(users.detail.build("1"))).toEqual(["queryKey", "queryFn"]);
  });

  it("mutation build returns only mutationFn", () => {
    const api = createMicroApi({
      name: "main",
      baseUrl: "/api",
      fetcher: async () => new Response("{}"),
    });
    const users = api.resource("users", {
      create: api.post<{ id: string }, { name: string }>("/users"),
    });

    expect(Object.keys(users.create.build())).toEqual(["mutationFn"]);
  });
});
