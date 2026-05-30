import { useMutation, useQuery } from "@tanstack/react-query";
import { createMicroApi } from "../src";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

type User = {
  id: string;
  name: string;
};

type CreateUserDto = {
  name: string;
};

const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
});

const users = api.resource("users", {
  list: api.get<User[], { page: number }>("/users", {
    query: (params) => params,
  }),
  detail: api.get<User, string>((id) => `/users/${id}`),
  create: api.post<User, CreateUserDto>("/users"),
});

const me = api.resource("me", {
  get: api.get<User>("/me"),
});

const auth = api.resource("auth", {
  login: api.post<User, CreateUserDto>("/auth/login", {
    authMode: "none",
  }),
  me: api.get<User>("/auth/me", {
    authMode: "required",
  }),
});

const detail = users.detail.build("user-1");
type DetailResult = Awaited<ReturnType<typeof detail.queryFn>>;
type _QueryOutput = Expect<Equal<DetailResult, User>>;

users.list.build({ page: 1 });
// @ts-expect-error query input is inferred
users.list.build({ wrong: 1 });

// @ts-expect-error wrong detail input type fails
users.detail.build(123);

const mutation = users.create.build();
type MutationVariables = Parameters<typeof mutation.mutationFn>[0];
type MutationResult = Awaited<ReturnType<typeof mutation.mutationFn>>;
type _MutationVariables = Expect<Equal<MutationVariables, CreateUserDto>>;
type _MutationResult = Expect<Equal<MutationResult, User>>;

users.create.fn({ name: "John" });
// @ts-expect-error mutation variables are inferred
users.create.fn({ wrong: "field" });

me.get.build();
me.get.key();
me.get.fn();
auth.me.build();
auth.login.fn({ name: "John" });

useQuery({
  ...users.detail.build("user-1"),
  select: (user) => user.name,
});

useMutation({
  ...users.create.build(),
});
