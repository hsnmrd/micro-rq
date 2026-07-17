# micro-rq

Define REST endpoints once and use them with TanStack Query without wrapping TanStack Query.

Docs: https://micro-rq-docs.vercel.app/

TanStack Query is excellent at caching, background refetching, retries, mutations, invalidation, and async server-state orchestration. In REST apps, the repeated work is usually not TanStack Query itself. It is the code around it: building URLs, serializing query params, creating stable query keys, adding auth headers, parsing responses, refreshing tokens, and keeping request functions consistent across screens.

`micro-rq` is a small resource builder for that surrounding REST layer. You describe each REST endpoint once, then use the generated output directly with TanStack Query.

It gives you:

- stable query keys for invalidation and exact cache targeting
- request functions for direct calls and tests
- `useQuery`-ready configs with `queryKey` and `queryFn`
- `useMutation`-ready configs with `mutationFn`
- shared base URLs, headers, auth modes, token refresh, response parsing, and error handling

It is useful when your app already uses TanStack Query and you want a typed, consistent REST layer without creating another hook abstraction.

It does not generate React hooks, replace TanStack Query, implement caching, or hide TanStack Query options. You still call `useQuery`, `useMutation`, `invalidateQueries`, and pass options such as `enabled`, `staleTime`, `select`, and `onSuccess` yourself.

## Install

```sh
npm install micro-rq @tanstack/react-query
```

`@tanstack/react-query` is a peer dependency.

## Quick Start

### Step 1: Create an API client

```ts
import { createMicroApi } from "micro-rq";

export const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
});
```

`name` is included in query keys. This keeps keys from different APIs separate.

### Step 2: Define a resource

```ts
type User = {
  id: string;
  name: string;
  email: string;
};

type CreateUserDto = {
  name: string;
  email: string;
};

export const users = api.resource("users", {
  list: api.get<User[], { page: number }>("/users", {
    query: (params) => params,
  }),
  detail: api.get<User, string>((id) => `/users/${id}`),
  create: api.post<User, CreateUserDto>("/users"),
});
```

GET endpoints become query endpoints. POST, PUT, PATCH, and DELETE endpoints become mutation endpoints.

### Step 3: Use query endpoints

```ts
const usersQuery = useQuery({
  ...users.list.toQuery({ page: 1 }),
  staleTime: 60_000,
});

const userQuery = useQuery({
  ...users.detail.toQuery(userId),
  enabled: Boolean(userId),
});
```

`toQuery()` returns only:

```ts
{
  queryKey,
  queryFn,
}
```

### Step 4: Use mutation endpoints

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

`toMutation()` returns only:

```ts
{
  mutationFn,
}
```

Mutation variables are passed to `mutate()`, not to `toMutation()`.

## Query Keys

Keys follow this shape:

```ts
[apiName, resourceName, endpointName, variables?]
```

```ts
users.list.baseKey();
// ["main", "users", "list"]

users.list.key({ page: 1 });
// ["main", "users", "list", { page: 1 }]

users.detail.key("user-1");
// ["main", "users", "detail", "user-1"]
```

Use `baseKey()` when you want to invalidate every query for one endpoint:

```ts
queryClient.invalidateQueries({
  queryKey: users.list.baseKey(),
});
```

Use `key(input)` when you want one exact query key.

## Request Mapping

Paths can be static or dynamic:

```ts
api.get<User[]>("/users");
api.get<User, string>((id) => `/users/${id}`);
```

Use mappers when request variables do not match the final request directly:

```ts
api.get<User[], { page: number; search?: string }>("/users", {
  query: (params) => params,
});

api.patch<User, { id: string; body: Partial<User> }>(
  ({ id }) => `/users/${id}`,
  {
    body: ({ body }) => body,
  },
);
```

Query serialization rules:

- `undefined` values are ignored.
- `null` becomes `"null"`.
- arrays repeat keys, for example `?tags=a&tags=b`
- objects are JSON-stringified.

For non-GET methods, variables are sent as the JSON body by default unless a `body` mapper is provided. GET requests never send a body.

## Auth and Refresh

```ts
import { createMicroApi, createTokenProvider } from "micro-rq";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const authApi = createMicroApi({
  name: "auth",
  baseUrl: "/api",
});

const auth = authApi.resource("auth", {
  refresh: authApi.post<AuthTokens, { refreshToken?: string | null }>("/refresh", {
    authMode: "none",
  }),
});

const tokenProvider = createTokenProvider({
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

export const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  tokenProvider,
  authHeader: (token) => ({
    Authorization: `Bearer ${token}`,
  }),
});
```

If a request returns `401` and refresh is configured, `micro-rq` refreshes once and retries the original request once. Parallel `401` responses share the same refresh promise.

Endpoint auth modes:

- `optional`: default. Use a token when one exists.
- `none`: skip token lookup, auth header injection, and refresh-on-401.
- `required`: require an access token before calling `fetch`; throws `MicroAuthRequiredError` if missing.

## Errors

Failed HTTP responses throw `MicroApiError`.

```ts
import { MicroApiError } from "micro-rq";

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

You can also observe failures at the API-client level:

```ts
const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  onError: (error, context) => {
    console.log(context.method, context.url, error);
  },
});
```

The original error is still thrown so TanStack Query retries, error state, callbacks, and error boundaries keep working normally.

## Next.js SSR Hydration

Use generated query configs with TanStack Query's `prefetchQuery`, then hydrate for Client Components.

```tsx
// app/products/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { products } from "../api/resources/products";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const queryClient = new QueryClient();
  const params = { limit: 12, skip: 0 };

  await queryClient.prefetchQuery(products.list.toQuery(params));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsClient params={params} />
    </HydrationBoundary>
  );
}
```

```tsx
// app/products/products-client.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { products } from "../api/resources/products";

export function ProductsClient({ params }: { params: { limit: number; skip: number } }) {
  const productsQuery = useQuery({
    ...products.list.toQuery(params),
  });

  // Render productsQuery.data.
}
```

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

## Public API

The root package export is the public API.

Runtime exports:

- `createMicroApi`
- `createTokenProvider`
- `MicroApiError`
- `MicroAuthRequiredError`

Type exports:

- `MicroApi`
- `CreateMicroApiConfig`
- `MicroRequestContext`
- `TokenProvider`
- `TokenProviderConfig`
- `RefreshTokenConfig`
- `BuiltResource`
- `QueryEndpoint`
- `MutationEndpoint`
- `QueryConfig`
- `MutationConfig`
- `MicroQueryKey`
- `VariablesArgs`
- `AuthMode`
- `BodyType`
- `HttpMethod`
- `MaybePromise`
- `PathBuilder`
- `RequestMappers`

## Examples and Docs

Example app:

```sh
cd examples/next
npm install
npm run dev
```

Docs app source:

```sh
cd docs
npm install
npm run dev
```

## Publishing

```sh
npm run release:check
npm publish
```

`release:check` runs typecheck, tests, type tests, build, and `npm pack --dry-run`.

Published files are limited to `dist`, `README.md`, `CHANGELOG.md`, and `LICENSE`.
