# tanstack-rest-query

Define REST resources once and generate TanStack Query configs without wrapping TanStack Query.

`tanstack-rest-query` does not replace TanStack Query. It only removes repeated code around base URLs, headers, auth tokens, refresh handling, REST request functions, query keys, query functions, and mutation functions.

You still use TanStack Query normally:

```ts
useQuery({
  ...users.detail.toQuery(userId),
  enabled: !!userId,
  staleTime: 60_000,
  select: (user) => user.name,
});
```

```ts
useMutation({
  ...users.create.toMutation(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: users.list.baseKey(),
    });
  },
});
```

## What It Does Not Do

`tanstack-rest-query` does not generate React hooks, wrap `useQuery`, wrap `useMutation`, implement caching, or hide TanStack Query options. `toQuery()` and `toMutation()` never accept React Query options such as `enabled`, `staleTime`, `retry`, `select`, or `onSuccess`.

## Installation

```sh
npm install tanstack-rest-query @tanstack/react-query
```

`@tanstack/react-query` is a peer dependency.

## Basic Usage

```ts
import { createMicroApi } from "tanstack-rest-query";

const mainApi = createMicroApi({
  name: "main",
  baseUrl: "/api",
});

type User = {
  id: string;
  name: string;
  email: string;
};

type CreateUserDto = {
  name: string;
  email: string;
};

export const users = mainApi.resource("users", {
  list: mainApi.get<User[], { page: number }>("/users", {
    query: (params) => params,
  }),
  detail: mainApi.get<User, string>((id) => `/users/${id}`),
  create: mainApi.post<User, CreateUserDto>("/users"),
});
```

## React Query Usage

```ts
const usersQuery = useQuery({
  ...users.list.toQuery({ page: 1 }),
  staleTime: 60_000,
});
```

```ts
const userQuery = useQuery({
  ...users.detail.toQuery(userId),
  enabled: !!userId,
});
```

```ts
const createUser = useMutation({
  ...users.create.toMutation(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: users.list.baseKey(),
    });
  },
});

createUser.mutate({
  name: "John",
  email: "john@example.com",
});
```

## Multiple Backends

Each API client has its own `name`, and that name is included in query keys.

```ts
const mainApi = createMicroApi({
  name: "main",
  baseUrl: "https://api.example.com",
});

const paymentApi = createMicroApi({
  name: "payment",
  baseUrl: "https://payment.example.com",
});

export const users = mainApi.resource("users", {
  list: mainApi.get<User[]>("/users"),
});

export const invoices = paymentApi.resource("invoices", {
  list: paymentApi.get<Invoice[]>("/invoices"),
});
```

Generated keys do not collide:

```ts
users.list.key();
// ["main", "users", "list"]

invoices.list.key();
// ["payment", "invoices", "list"]
```

## Token Provider

```ts
import { createMicroApi, createTokenProvider } from "tanstack-rest-query";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const publicApi = createMicroApi({
  name: "public",
  baseUrl: "https://auth.example.com",
});

const auth = publicApi.resource("auth", {
  refresh: publicApi.post<AuthTokens, { refreshToken?: string | null }>("/refresh", {
    authMode: "none",
  }),
});

const authProvider = createTokenProvider({
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  refresh: {
    fn: ({ refreshToken }) => auth.refresh.fn({ refreshToken }),
    selectAccessToken: (tokens) => tokens.accessToken,
    onSuccess: (tokens) => {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
    },
    onError: () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

const mainApi = createMicroApi({
  name: "main",
  baseUrl: "https://api.example.com",
  tokenProvider: authProvider,
  authHeader: (token) => ({
    Authorization: `Bearer ${token}`,
  }),
});
```

Before a request, `getAccessToken()` is called. If a request returns `401` and `refresh` is configured, the token provider refreshes once and retries the original request once. Parallel `401` responses share the same refresh promise.

## Resource Example

```ts
export const users = mainApi.resource("users", {
  list: mainApi.get<User[], UserListParams>("/users", {
    query: (params) => params,
  }),
  detail: mainApi.get<User, string>((id) => `/users/${id}`),
  create: mainApi.post<User, CreateUserDto>("/users"),
  update: mainApi.patch<User, { id: string; body: UpdateUserDto }>(
    ({ id }) => `/users/${id}`,
    {
      body: ({ body }) => body,
    },
  ),
  remove: mainApi.delete<void, string>((id) => `/users/${id}`),
});
```

## Query Key Rules

Query keys follow this structure:

```ts
[apiName, resourceName, endpointName, ...args]
```

Examples:

```ts
users.list.key();
// ["main", "users", "list"]

users.list.key({ page: 1 });
// ["main", "users", "list", { page: 1 }]

users.detail.key("user-1");
// ["main", "users", "detail", "user-1"]
```

## `baseKey()` vs `key()`

Use `baseKey()` to invalidate all queries under one endpoint:

```ts
queryClient.invalidateQueries({
  queryKey: users.list.baseKey(),
});
```

Use `key(input)` to target one exact query:

```ts
queryClient.invalidateQueries({
  queryKey: users.detail.key(userId),
});
```

## Request Mapping

Paths can be static or dynamic:

```ts
api.get<User[]>("/users");
api.get<User, string>((id) => `/users/${id}`);
```

Request mappers support `query`, `body`, and per-request `headers`:

```ts
api.get<User[], UserListParams>("/users", {
  query: (params) => params,
});

api.patch<User, { id: string; body: UpdateUserDto }>(
  ({ id }) => `/users/${id}`,
  {
    body: ({ body }) => body,
  },
);
```

Use `authMode` to control token behavior for an endpoint:

```ts
api.post<LoginResponse, LoginDto>("/auth/login", {
  authMode: "none",
});

api.get<AuthUser>("/auth/me", {
  authMode: "required",
});
```

`"optional"` is the default: use a token when one exists, but still allow the request without one.
`"none"` skips token lookup, auth header injection, and refresh-on-401.
`"required"` requires an access token before the request and throws `MicroAuthRequiredError` without calling `fetch` when none exists.

For non-GET methods, variables are serialized as the JSON body by default unless a `body` mapper is provided. GET requests never send a body.

Query serialization rules:

- `undefined` values are ignored.
- `null` becomes `"null"`.
- Arrays repeat keys, for example `?tags=a&tags=b`.
- Objects are JSON-stringified.

## Error Handling

Failed responses throw `MicroApiError`.

```ts
import { MicroApiError } from "tanstack-rest-query";

try {
  await users.detail.fn("user-1")();
} catch (error) {
  if (error instanceof MicroApiError) {
    console.log(error.status);
    console.log(error.statusText);
    console.log(error.data);
    console.log(error.response);
  }
}
```

If the error response body is JSON, `data` is parsed JSON. If it is text, `data` is text. If it is empty, `data` is `null`.

You can observe request failures at the API-client level with `onError`. The original error is still thrown so TanStack Query error state, retries, callbacks, and error boundaries keep working normally.

```ts
const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  onError: (error, context) => {
    if (error instanceof MicroApiError && error.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }

    console.log(context.method, context.url);
  },
});
```

`onError` is called for failed HTTP responses, missing required auth, refresh failures, and network errors. If `onError` throws, `tanstack-rest-query` preserves the original request error.

## TypeScript

Inputs and outputs are inferred from endpoint definitions.

```ts
const q = users.detail.toQuery("user-1");
// q.queryFn returns Promise<User>

const m = users.create.toMutation();
// m.mutationFn accepts CreateUserDto and returns Promise<User>
```

These fail type checking:

```ts
users.detail.toQuery(123);
users.create.fn({ wrong: "field" });
```

No-variable endpoints do not require `undefined`:

```ts
const me = api.resource("me", {
  get: api.get<User>("/me"),
});

me.get.toQuery();
me.get.key();
me.get.fn();
```

## API Reference

### `createMicroApi(config)`

```ts
type CreateMicroApiConfig = {
  name: string;
  baseUrl: string;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  tokenProvider?: TokenProvider;
  authHeader?: (token: string) => HeadersInit;
  fetcher?: typeof fetch;
  onError?: (error: unknown, context: MicroRequestContext) => void | Promise<void>;
};
```

Creates an API client with:

- `api.get<TData, TVariables>()`
- `api.post<TData, TVariables>()`
- `api.put<TData, TVariables>()`
- `api.patch<TData, TVariables>()`
- `api.delete<TData, TVariables>()`
- `api.resource(resourceName, endpoints)`
- `api.extend(overrides)`

GET endpoints become query endpoints. POST, PUT, PATCH, and DELETE endpoints become mutation endpoints.
Use `api.extend(overrides)` to reuse a client config and override only selected fields, such as `name` or `fetcher`.

### Query Endpoint

```ts
users.detail.baseKey();
users.detail.key("user-1");
users.detail.fn("user-1");
users.detail.toQuery("user-1");
```

`toQuery()` returns only:

```ts
{
  queryKey,
  queryFn,
}
```

### Mutation Endpoint

```ts
users.create.fn({ name: "John", email: "john@example.com" });
users.create.toMutation();
```

`toMutation()` returns only:

```ts
{
  mutationFn,
}
```

Mutation variables are passed to `mutate()`, not to `toMutation()`.

### `createTokenProvider(config)`

```ts
type TokenProviderConfig<TTokens = unknown> = {
  getAccessToken: () => string | null | Promise<string | null>;
  getRefreshToken?: () => string | null | Promise<string | null>;
  refresh?: {
    fn: (input: { refreshToken?: string | null }) => Promise<TTokens>;
    selectAccessToken?: (tokens: TTokens) => string;
    onSuccess?: (tokens: TTokens) => void | Promise<void>;
    onError?: (error: unknown) => void | Promise<void>;
  };
};
```

## Publishing

The package builds ESM, CJS, and type declarations with `tsup`.

```sh
npm run typecheck
npm run test
npm run test:types
npm run build
npm publish
```

The published files are limited to `dist`, `README.md`, and `LICENSE`.

## Next.js App Router Example

The example app is in `examples/react-vite`. Despite the historical folder name, it is a Next.js App Router app.

```sh
cd examples/react-vite
npm install
npm run dev
```

Open `http://localhost:3000`.

The example uses one `createMicroApi` client with `baseUrl: "https://dummyjson.com"`.
It demonstrates public REST resources for users and carts, plus DummyJSON auth endpoints
for login, authenticated `/auth/me`, and refresh-token flow testing.

## Docs App

A Next.js + Tailwind documentation app is available in `docs/`.

```sh
cd docs
npm install
npm run dev
```
