export type CodeBlock = {
  code: string;
};

export type DocSection = {
  id: string;
  title: string;
  eyebrow?: string;
  tone?: "default" | "warning" | "info";
  body: string[];
  code?: CodeBlock[];
  items?: string[];
};

export type DocPage = {
  slug: string;
  title: string;
  description: string;
  sectionIds: string[];
};

export const sections: DocSection[] = [
  {
    id: "what-is",
    title: "What is micro-rq?",
    body: [
      "**micro-rq** helps you define a REST endpoint once and reuse it everywhere.",
      "It does not replace TanStack Query. It prepares the repeated request pieces for you, such as `queryKey`, `queryFn`, `mutationFn`, URLs, headers, parsing, auth, and token refresh.",
      "You still use TanStack Query normally with `useQuery`, `useMutation`, `invalidateQueries`, and your usual query options.",
    ],
    items: [
      "Describe each REST endpoint once.",
      "Let TanStack Query handle caching and hook behavior.",
      "Move request setup out of UI components.",
      "Keep UI components focused on using hooks.",
    ],
  },
  {
    id: "problem",
    title: "The problem it solves",
    body: [
      "In many REST apps, one endpoint is described in too many places. The URL may live in one file, the query key in another, and the invalidation logic in a third.",
      "That repeated work is not really TanStack Query logic. It is the REST setup around TanStack Query.",
      "`micro-rq` **keeps that setup in one place** so each endpoint has one typed definition and one stable query key shape.",
      "The example below shows the problem first, then shows how this package solves it.",
    ],
    code: [
      {
        code: `// In many REST apps, one endpoint is still described in several places.
useQuery({
  queryKey: ["users", "detail", userId],
  queryFn: async () => {
    const response = await fetch(\`/api/users/\${userId}\`, {
      headers: {
        Authorization: \`Bearer \${token}\`,
      },
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    return response.json() as Promise<User>;
  },
  enabled: Boolean(userId),
});

// With micro-rq, the endpoint owns URL, fetch, parsing, and key shape.
useQuery({
  ...users.detail.toQuery(userId),
  enabled: Boolean(userId),
});`,
      },
    ],
  },
  {
    id: "install",
    title: "Install",
    body: [
      "Install **micro-rq** next to **TanStack Query**. TanStack Query is a peer dependency because your app still uses it directly.",
    ],
    code: [{ code: "npm install micro-rq @tanstack/react-query" }],
  },
  {
    id: "step-client",
    title: "Step 1: Create an API client",
    body: [
      "Start by creating one API client.",
      "This client holds the request settings that many endpoints share, such as the base URL and global headers.",
      "Usually, you begin with `name` and `baseUrl`. The `name` is added to generated query keys so keys from different APIs do not collide.",
    ],
    items: [
      "name: a namespace used in generated query keys.",
      "baseUrl: the base URL for relative endpoint paths.",
      "headers: optional headers added to every request.",
      "fetcher: optional custom fetch function. Default is `globalThis.fetch`.",
      "onError: optional global error handler for request and auth errors.",
    ],
    code: [
      {
        code: `// api/client.ts
import { createMicroApi } from "micro-rq";

export const api = createMicroApi({
  name: "main",
  baseUrl: "https://api.example.com",
});`,
      },
    ],
  },
  {
    id: "step-resource",
    title: "Step 2: Define a resource",
    body: [
      "Next, group related endpoints into a resource such as `users`, `posts`, `auth`, or `orders`.",
      "Each endpoint describes what it returns, and when needed, what variables it accepts.",
    ],
    items: [
      "GET endpoints become query endpoints.",
      "POST, PUT, PATCH, and DELETE endpoints become mutation endpoints.",
      "The first generic is the response type.",
      "The second generic is the variables type.",
      "If an endpoint has no variables, you can omit the second generic.",
    ],
    code: [
      {
        code: `// api/resources/users.ts
import { api } from "../client";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type CreateUserDto = {
  name: string;
  email: string;
};

export const users = api.resource("users", {
  list: api.get<User[]>("/users"),
  detail: api.get<User, string>((id) => \`/users/\${id}\`),
  create: api.post<User, CreateUserDto>("/users"),
});`,
      },
    ],
  },
  {
    id: "step-query",
    title: "Step 3: Use a query endpoint",
    body: [
      "A query endpoint gives you helpers such as `toQuery()`, `key()`, `baseKey()`, and `fn()`.",
      "Most of the time, you will use `toQuery()` inside `useQuery` and then add your normal TanStack Query options next to it.",
    ],
    items: [
      "toQuery(variables): returns `{ queryKey, queryFn }`.",
      "key(variables): returns the exact key for one request.",
      "baseKey(): returns the stable prefix for broader invalidation.",
      "fn(variables): runs the request directly.",
    ],
    code: [
      {
        code: `import { useQuery } from "@tanstack/react-query";
import { users } from "../api/resources/users";

export function UserDetail({ userId }: { userId?: string }) {
  const userQuery = useQuery({
    ...users.detail.toQuery(userId ?? ""),
    enabled: Boolean(userId),
    staleTime: 60_000,
    select: (user) => user.name,
  });

  return <div>{userQuery.data}</div>;
}`,
      },
    ],
  },
  {
    id: "step-mutation",
    title: "Step 4: Use a mutation endpoint",
    body: [
      "A mutation endpoint gives you `toMutation()` and `fn()`.",
      "Use `toMutation()` inside `useMutation`. Then pass variables to `mutate` or `mutateAsync`, not to `toMutation()` itself.",
    ],
    items: [
      "toMutation(): returns `{ mutationFn }`.",
      "fn(variables): runs the request directly.",
      "Pass mutation variables through TanStack Query's `mutate` or `mutateAsync`.",
      "Use generated keys for invalidation after success.",
    ],
    code: [
      {
        code: `import { useMutation, useQueryClient } from "@tanstack/react-query";
import { users } from "../api/resources/users";

export function CreateUserButton() {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    ...users.create.toMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: users.list.baseKey(),
      });
    },
  });

  return (
    <button
      type="button"
      onClick={() => {
        createUser.mutate({
          name: "Jane",
          email: "jane@example.com",
        });
      }}
    >
      Create user
    </button>
  );
}`,
      },
    ],
  },
  {
    id: "mental-model",
    title: "The mental model",
    body: [
      "This package is easier to understand if you think about it in three layers: **client**, **resource**, and **endpoint**.",
      "The **client** stores shared settings like base URL, headers, and auth. A **resource** groups related endpoints like `users` or `auth`. An **endpoint** describes one request, such as get user or create post.",
    ],
  },
  {
    id: "paths",
    title: "Paths and variables",
    body: [
      "Endpoint paths can be static strings or functions.",
    ],
    code: [
      {
        code: `const users = api.resource("users", {
  // Static path: the URL path is always the same.
  list: api.get<User[]>("/users"),

  // Function path: the URL path is built from variables.
  detail: api.get<User, string>((id) => \`/users/\${id}\`),
});`,
      },
    ],
  },
  {
    id: "path-function-variables-info",
    title: "Function path variables",
    eyebrow: "Info",
    tone: "info",
    body: [
      "When the path is a function, it receives the same variables that are passed to `toQuery()`, `fn()`, `mutate()`, or `mutateAsync()`.",
    ],
    code: [
      {
        code: `type UpdateUserInput = {
  id: string;
  body: {
    name: string;
  };
};

const users = api.resource("users", {
  detail: api.get<User, string>((id) => \`/users/\${id}\`),
  update: api.patch<User, UpdateUserInput>(({ id }) => \`/users/\${id}\`, {
    body: ({ body }) => body,
  }),
});

users.detail.toQuery("user-1");
// Path function receives "user-1" and builds /users/user-1.

await users.update.fn({
  id: "user-1",
  body: {
    name: "Jane",
  },
});
// Path function receives the object and uses variables.id.`,
      },
    ],
  },
  {
    id: "query-serialization",
    title: "Query serialization",
    body: [
      "Use the `query` mapper when an endpoint needs URL search params.",
      "Return a plain object from the mapper. micro-rq turns that object into the final query string.",
      "This keeps endpoint paths clean and avoids manually writing strings like `?page=1`.",
    ],
    items: [
      "`undefined` values are skipped.",
      "`null` is sent as `null`.",
      "Arrays repeat the same key, for example `tags=a&tags=b`.",
      "Objects are converted with `JSON.stringify()`.",
      "Numbers and booleans are converted to strings.",
    ],
  },
  {
    id: "body-headers",
    title: "Bodies and headers",
    body: [
      "Mutation endpoints often send data to the server.",
      "By default, non-GET variables are sent as the JSON body.",
      "Use a `body` mapper when only part of the variables should be sent as the body.",
      "Headers can come from the API client, the endpoint, and auth. They are merged in that order.",
    ],
    items: [
      "Plain objects are converted with `JSON.stringify()`.",
      "`FormData`, `Blob`, and `URLSearchParams` are passed through unchanged.",
      "Do not set `content-type` manually for `FormData`; the browser adds the multipart boundary.",
    ],
  },
  {
    id: "json-content-type-info",
    title: "JSON content-type",
    eyebrow: "Info",
    tone: "info",
    body: [
      "`content-type: application/json` is added for JSON bodies when no content type exists.",
      "If you provide a `content-type` header yourself, micro-rq keeps your value.",
    ],
  },
  {
    id: "keys",
    title: "Query keys",
    body: [
      "Generated query keys follow one stable shape.",
      "The API name avoids collisions between different backends. The resource and endpoint names keep the key readable. Variables are appended when the endpoint uses them.",
    ],
    code: [
      {
        code: `users.list.key();
// ["main", "users", "list"]

users.detail.key("user-1");
// ["main", "users", "detail", "user-1"]

users.list.baseKey();
// ["main", "users", "list"]`,
      },
    ],
  },
  {
    id: "invalidation",
    title: "Invalidation",
    body: [
      "Use `baseKey()` when a mutation should refresh a group of related queries.",
      "Use `key(variables)` when you want to refresh one exact query.",
    ],
    code: [
      {
        code: `const updateUser = useMutation({
  ...users.update.toMutation(),
  onSuccess: (updatedUser) => {
    queryClient.invalidateQueries({
      queryKey: users.detail.key(updatedUser.id),
    });

    queryClient.invalidateQueries({
      queryKey: users.list.baseKey(),
    });
  },
});`,
      },
    ],
  },
  {
    id: "resource-overview",
    title: "Resources",
    eyebrow: "Endpoint groups",
    body: [
      "After you create an API client, the next step is to group endpoints into resources.",
      "A resource is usually one domain in your app, such as `users`, `auth`, `products`, or `orders`.",
      "Put endpoints that belong to the same domain inside the same resource.",
      "The resource name is also used in generated query keys, so keep it short and stable.",
    ],
    items: [
      "Use stable names like `users`, `auth`, `orders`, or `products`.",
      "Do not put IDs, filters, dates, or user-specific values in the resource name.",
      "A resource can contain both read endpoints and write endpoints.",
      "The returned resource is typed, so its helpers keep the endpoint inputs and outputs connected.",
    ],
    code: [
      {
        code: `export const users = api.resource("users", {
  list: api.get<User[]>("/users"),
  detail: api.get<User, string>((id) => \`/users/\${id}\`),
  create: api.post<User, CreateUserDto>("/users"),
  update: api.patch<User, UpdateUserDto>(({ id }) => \`/users/\${id}\`),
  remove: api.delete<void, string>((id) => \`/users/\${id}\`),
});`,
      },
    ],
  },
  {
    id: "resource-definition",
    title: "Defining endpoints",
    body: [
      "Inside `api.resource()`, each property is one endpoint.",
      "The property name should describe what the endpoint does.",
      "Use `api.get()` for reads. Use `api.post()`, `api.put()`, `api.patch()`, or `api.delete()` for writes.",
    ],
    items: [
      "`api.get()` creates a query endpoint.",
      "`api.post()`, `api.put()`, `api.patch()`, and `api.delete()` create mutation endpoints.",
      "Good endpoint names are `list`, `detail`, `search`, `create`, `update`, and `remove`.",
      "The first generic is the response type.",
      "The second generic is the variables type, only when the endpoint needs input.",
    ],
    code: [
      {
        code: `type User = {
  id: string;
  name: string;
};

type SearchUsersInput = {
  q?: string;
  page?: number;
};

type UpdateUserInput = {
  id: string;
  body: {
    name: string;
  };
};

export const users = api.resource("users", {
  list: api.get<User[]>("/users"),
  search: api.get<User[], SearchUsersInput>("/users/search"),
  detail: api.get<User, string>((id) => \`/users/\${id}\`),
  update: api.patch<User, UpdateUserInput>(({ id }) => \`/users/\${id}\`),
});`,
      },
    ],
  },
  {
    id: "resource-generics",
    title: "Response and variables types",
    body: [
      "Each endpoint can describe two types: what it returns, and what it needs as input.",
      "The first generic is always the response type.",
      "The second generic is the variables type. Add it only when callers must pass input.",
      "Those variables are later passed to helpers like `toQuery()`, `fn()`, `mutate()`, and `mutateAsync()`.",
    ],
    items: [
      "Use only one generic when the endpoint has no variables, like `api.get<User[]>(\"/users\")`.",
      "Use a simple type like `string` when the endpoint needs one value.",
      "Use an object type when the endpoint needs more than one value.",
      "Mutation variables are passed to `mutate(variables)` or `mutateAsync(variables)`.",
    ],
    code: [
      {
        code: `const users = api.resource("users", {
  list: api.get<User[]>("/users"),
  detail: api.get<User, string>((id) => \`/users/\${id}\`),
  search: api.get<User[], { q: string; page: number }>("/users"),
  create: api.post<User, { name: string; email: string }>("/users"),
});

users.list.toQuery();          // no variables
users.detail.toQuery("user-1"); // string variables
users.search.toQuery({ q: "jane", page: 1 });`,
      },
    ],
  },
  {
    id: "resource-paths",
    title: "Static and dynamic paths",
    body: [
      "Every endpoint needs a path.",
      "A static path is just a string, such as `\"/posts\"`.",
      "A dynamic path is a function. Use it when the URL needs a variable, such as a post ID.",
      "The path function receives the same variables that you pass when you call the endpoint helper.",
    ],
    items: [
      "Static paths work well for list and create endpoints.",
      "Dynamic paths work well for detail, update, and delete endpoints.",
      "Return only the path part when `baseUrl` already contains the host.",
    ],
    code: [
      {
        code: `const posts = api.resource("posts", {
  list: api.get<Post[]>("/posts"),
  detail: api.get<Post, string>((postId) => \`/posts/\${postId}\`),
  comments: api.get<Comment[], { postId: string }>(
    ({ postId }) => \`/posts/\${postId}/comments\`,
  ),
});`,
      },
    ],
  },
  {
    id: "query-string-warning",
    title: "Avoid manual query strings",
    eyebrow: "Warning",
    tone: "warning",
    body: [
      "Keep paths focused on the path part only. Prefer the `query` mapper instead of manually adding `?page=...` to endpoint paths.",
    ],
  },
  {
    id: "resource-request-mappers",
    title: "Endpoint request mappers",
    body: [
      "Sometimes variables are not only used in the path.",
      "They may also become query params, a request body, request headers, or auth behavior.",
      "Request mappers describe those parts in one place, next to the endpoint.",
    ],
    items: [
      "`query` turns variables into URL search params.",
      "`body` chooses what should be sent as the request body.",
      "`bodyType` switches between JSON and FormData bodies.",
      "`headers` adds headers for this endpoint call.",
      "`authMode` controls whether this endpoint uses auth.",
      "For non-GET requests, variables become the JSON body when no `body` mapper is provided.",
    ],
    code: [
      {
        code: `type SearchUsersInput = {
  q?: string;
  page?: number;
  tags?: string[];
};

type UpdateUserInput = {
  id: string;
  body: {
    name: string;
  };
  traceId: string;
};

export const users = api.resource("users", {
  search: api.get<User[], SearchUsersInput>("/users", {
    query: ({ q, page, tags }) => ({ q, page, tags }),
  }),
  update: api.patch<User, UpdateUserInput>(
    ({ id }) => \`/users/\${id}\`,
    {
      body: ({ body }) => body,
      headers: ({ traceId }) => ({
        "x-trace-id": traceId,
      }),
      authMode: "required",
    },
  ),
});`,
      },
    ],
  },
  {
    id: "resource-query-endpoints",
    title: "Query endpoint helpers",
    body: [
      "GET endpoints are used for reading data.",
      "They expose helpers that fit TanStack Query's `useQuery()` API.",
      "They also expose key helpers, so you can invalidate or refetch the right cached data.",
    ],
    items: [
      "`toQuery()` returns the object you spread into `useQuery()`.",
      "`key()` returns the exact query key for one endpoint call.",
      "`baseKey()` returns the shared key prefix for broader invalidation.",
      "`fn()` gives you the request function when you want to call it yourself.",
    ],
    code: [
      {
        code: `const userQuery = useQuery({
  ...users.detail.toQuery("user-1"),
  staleTime: 60_000,
});

queryClient.invalidateQueries({
  queryKey: users.detail.key("user-1"),
});

queryClient.invalidateQueries({
  queryKey: users.list.baseKey(),
});

const loadUser = users.detail.fn("user-1");
const user = await loadUser();`,
      },
    ],
  },
  {
    id: "resource-mutation-endpoints",
    title: "Mutation endpoint helpers",
    body: [
      "POST, PUT, PATCH, and DELETE endpoints are used for changing data.",
      "They expose helpers that fit TanStack Query's `useMutation()` API.",
      "Unlike queries, mutation variables are passed when you call `mutate()` or `mutateAsync()`.",
    ],
    items: [
      "`toMutation()` returns the object you spread into `useMutation()`.",
      "`fn(variables)` runs the request directly.",
      "Use `onSuccess` to invalidate related query keys after a successful mutation.",
      "Mutations do not create query keys because TanStack Query does not cache them like queries.",
    ],
    code: [
      {
        code: `const updateUser = useMutation({
  ...users.update.toMutation(),
  onSuccess: (user) => {
    queryClient.invalidateQueries({
      queryKey: users.detail.key(user.id),
    });
  },
});

updateUser.mutate({
  id: "user-1",
  body: {
    name: "Jane",
  },
  traceId: crypto.randomUUID(),
});

await users.update.fn({
  id: "user-1",
  body: {
    name: "Jane",
  },
  traceId: "manual-call",
});`,
      },
    ],
  },
  {
    id: "resource-complete-example",
    title: "Complete resource example",
    body: [
      "This example puts the pieces together in one resource.",
      "It includes a list query, a detail query, an update mutation, query params, request body mapping, endpoint headers, auth mode, and invalidation.",
    ],
    code: [
      {
        code: `// api/resources/products.ts
import { api } from "../client";

export type Product = {
  id: string;
  title: string;
  price: number;
};

export type ProductFilters = {
  q?: string;
  category?: string;
  page?: number;
};

export type UpdateProductInput = {
  id: string;
  body: {
    title?: string;
    price?: number;
  };
  requestId: string;
};

export const products = api.resource("products", {
  list: api.get<Product[], ProductFilters>("/products", {
    query: (filters) => filters,
  }),
  detail: api.get<Product, string>((id) => \`/products/\${id}\`),
  update: api.patch<Product, UpdateProductInput>(
    ({ id }) => \`/products/\${id}\`,
    {
      body: ({ body }) => body,
      headers: ({ requestId }) => ({
        "x-request-id": requestId,
      }),
      authMode: "required",
    },
  ),
});

// components/ProductDetail.tsx
const productQuery = useQuery({
  ...products.detail.toQuery(productId),
  enabled: Boolean(productId),
});

const updateProduct = useMutation({
  ...products.update.toMutation(),
  onSuccess: (product) => {
    queryClient.invalidateQueries({
      queryKey: products.detail.key(product.id),
    });

    queryClient.invalidateQueries({
      queryKey: products.list.baseKey(),
    });
  },
});`,
      },
    ],
  },
  {
    id: "client-options-overview",
    title: "API client options",
    eyebrow: "createMicroApi",
    body: [
      "Every API starts with a client created by `createMicroApi`.",
      "`createMicroApi` defines settings shared by every resource created from that client.",
      "Use it to configure things like the base URL, global headers, auth headers, a custom `fetcher`, and global error handling.",
      "If something should be shared by many requests, it usually belongs on the client. If it only applies to one endpoint, it usually belongs on that endpoint.",
    ],
    items: [
      "name: query key namespace.",
      "baseUrl: root URL for endpoint paths.",
      "headers: headers sent with every request.",
      "tokenProvider: optional token and refresh manager.",
      "authHeader: turns an access token into request headers.",
      "fetcher: custom fetch implementation.",
      "onError: observes request failures.",
      "extend: creates another client from this one.",
    ],
    code: [
      {
        code: `import { createMicroApi } from "micro-rq";

export const api = createMicroApi({
  name: "main",
  baseUrl: "https://api.example.com",
  headers: () => ({
    "x-client": "web",
  }),
  tokenProvider,
  authHeader: (token) => ({
    Authorization: \`Bearer \${token}\`,
  }),
  fetcher: fetch,
  onError: (error, context) => {
    console.error(context.method, context.url, error);
  },
});`,
      },
    ],
  },
  {
    id: "client-name-baseurl",
    title: "name and baseUrl",
    body: [
      "`name` is only used inside generated query keys. It is not sent over the network.",
      "`baseUrl` is joined with each endpoint path before the request is sent.",
      "Use different `name` values when your app talks to multiple backends so their query keys stay separate.",
    ],
    items: [
      "Same-origin API: use `baseUrl: \"/api\"`.",
      "External API: use `baseUrl: \"https://api.example.com\"`.",
      "Multiple APIs: use different `name` values.",
      "Generated key: `name` is the first item in every query key.",
    ],
    code: [
      {
        code: `const mainApi = createMicroApi({
  name: "main",
  baseUrl: "https://api.example.com",
});

const billingApi = createMicroApi({
  name: "billing",
  baseUrl: "https://billing.example.com",
});

// mainApi users key starts with ["main", ...]
// billingApi invoices key starts with ["billing", ...]`,
      },
    ],
  },
  {
    id: "client-headers",
    title: "headers",
    body: [
      "`headers` adds global headers to every request made by this client.",
      "It accepts either a normal `HeadersInit` value or a function. The function can be async.",
      "Request headers can come from three layers: client `headers`, endpoint `headers`, and `authHeader`.",
      "Use client `headers` for values shared by many requests. Use endpoint `headers` when the value depends on endpoint variables.",
    ],
    items: [
      "Static headers: good for app version, client name, locale, or tenant.",
      "Async headers: good when values must be read at request time.",
      "Merge order: client `headers`, endpoint `headers`, then `authHeader`.",
      "Override rule: later headers replace earlier ones.",
    ],
    code: [
      {
        code: `const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  headers: {
    "x-client": "dashboard",
    "x-app-version": "1.4.0",
  },
});`,
      },
      {
        code: `const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  headers: async () => {
    const locale = localStorage.getItem("locale") ?? "en";

    return {
      "accept-language": locale,
    };
  },
});`,
      },
      {
        code: `const users = api.resource("users", {
  detail: api.get<User, { id: string; traceId: string }>(
    ({ id }) => \`/users/\${id}\`,
    {
      headers: ({ traceId }) => ({
        "x-trace-id": traceId,
      }),
    },
  ),
});`,
      },
    ],
  },
  {
    id: "client-auth-header",
    title: "authHeader",
    body: [
      "`authHeader` receives the current access token and returns the headers added to authenticated requests.",
      "Each endpoint can define `authMode`, which controls whether auth is used for that endpoint. It also controls whether `authHeader` can run.",
      "`authHeader` only runs when a token exists and the endpoint `authMode` is not `none`.",
      "Most APIs use a Bearer token, but you can return any auth header shape you need.",
    ],
    items: [
      "When `authMode` is `\"none\"`, token lookup and `authHeader` are skipped.",
      "When `authMode` is `\"required\"`, a missing token throws `MicroAuthRequiredError` before fetch runs.",
    ],
    code: [
      {
        code: `const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  tokenProvider,
  authHeader: (token) => ({
    Authorization: \`Bearer \${token}\`,
  }),
});`,
      },
      {
        code: `const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  tokenProvider,
  authHeader: (token) => ({
    "x-access-token": token,
  }),
});`,
      },
    ],
  },
  {
    id: "client-token-provider-note",
    title: "TokenProvider",
    eyebrow: "Info",
    tone: "info",
    body: ["We will cover `tokenProvider` next in the Authentication page."],
  },
  {
    id: "client-fetcher",
    title: "fetcher",
    body: [
      "`fetcher` replaces the fetch implementation used by micro-rq.",
      "By default, the package uses `globalThis.fetch`.",
      "Provide `fetcher` when you need a mock fetch in tests, when your environment has no global fetch, or when you want to wrap fetch with custom behavior.",
      "If only some endpoints need a custom fetcher, create another client with `api.extend()` instead of repeating the whole config.",
    ],
    items: [
      "Tests: pass a mock fetcher.",
      "Node environments: pass a fetch implementation when `globalThis.fetch` is unavailable.",
      "Instrumentation: wrap fetch to measure request duration.",
      "Session cookies: use a custom fetcher with `credentials: \"include\"`.",
      "Do not use `fetcher` for endpoint-specific headers or bodies.",
    ],
    code: [
      {
        code: `const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  fetcher: async (input, init) => {
    const startedAt = performance.now();

    try {
      return await fetch(input, init);
    } finally {
      console.log("request took", performance.now() - startedAt);
    }
  },
});`,
      },
      {
        code: `const mockFetcher: typeof fetch = async () =>
  new Response(JSON.stringify({ id: "user-1", name: "Jane" }), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });

const testApi = createMicroApi({
  name: "test",
  baseUrl: "https://example.test",
  fetcher: mockFetcher,
});`,
      },
      {
        code: `const sessionApi = createMicroApi({
  name: "session",
  baseUrl: "/api",
  fetcher: (input, init) =>
    fetch(input, {
      ...init,
      credentials: "include",
    }),
});`,
      },
      {
        code: `const uploadApi = api.extend({
  name: "uploads",
  fetcher: createUploadFetcher("avatar"),
});`,
      },
    ],
  },
  {
    id: "client-extend",
    title: "extend()",
    body: [
      "`extend()` creates another API client from the current one.",
      "Use it when most settings stay the same, but a few values need to change.",
      "This is especially useful for upload clients that share the same auth and base URL, but use a different `fetcher`.",
    ],
    items: [
      "Inherited: any config you do not override.",
      "Overridden: values passed to `extend()` replace the base config.",
      "Recommended: change `name` if the new client should have a separate query-key namespace.",
      "Common use: `api.extend({ name: \"uploads\", fetcher: uploadFetcher })`.",
    ],
    code: [
      {
        code: `export const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  tokenProvider,
  authHeader: (token) => ({
    Authorization: \`Bearer \${token}\`,
  }),
  onError,
});

export const uploadApi = api.extend({
  name: "uploads",
  fetcher: createUploadFetcher("avatar"),
});`,
      },
    ],
  },
  {
    id: "client-on-error",
    title: "onError",
    body: [
      "`onError` is a global error observer for this API client.",
      "It is called for failed HTTP responses, missing required auth, refresh failures, network failures, and response parsing failures.",
      "It does not replace the original error. The package calls `onError` and then still throws the original error to TanStack Query or your direct caller.",
    ],
    items: [
      "Logging: send `error` and `context` to your logger.",
      "Telemetry: record `context.method`, `context.url`, and `context.authMode`.",
      "Auth cleanup: detect auth errors and clear app state if needed.",
      "UI handling: keep user-facing messages in TanStack Query `onError` or component state.",
    ],
    code: [
      {
        code: `const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  onError: (error, context) => {
    reportApiError({
      error,
      method: context.method,
      path: context.path,
      url: context.url,
      authMode: context.authMode,
    });
  },
});`,
      },
      {
        code: `const userQuery = useQuery({
  ...users.detail.toQuery(userId),
  onError: (error) => {
    // Component-level UI behavior still belongs here.
    toast.error("Could not load user");
  },
});`,
      },
    ],
  },
  {
    id: "client-complete-example",
    title: "Complete client example",
    body: [
      "This example shows all client options together. In real apps, start small and add options only when you need them.",
      "The important separation is: client options define shared request behavior; endpoint mappers define endpoint-specific request behavior; TanStack Query options define UI caching behavior.",
    ],
    code: [
      {
        code: `import { createMicroApi } from "micro-rq";

export const publicApi = createMicroApi({
  name: "public",
  baseUrl: "/api",
});`,
      },
      {
        code: `import { publicApi } from "./public-api";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const auth = publicApi.resource("auth", {
  refresh: publicApi.post<AuthTokens, { refreshToken?: string | null }>("/auth/refresh", {
    authMode: "none",
  }),
});`,
      },
      {
        code: `import { createTokenProvider } from "micro-rq";
import { auth } from "./auth";

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
});`,
      },
      {
        code: `import { createMicroApi, MicroApiError } from "micro-rq";
import { tokenProvider } from "./token-provider";

export const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  headers: () => ({
    "accept-language": localStorage.getItem("locale") ?? "en",
    "x-client": "web",
  }),
  tokenProvider,
  authHeader: (token) => ({
    Authorization: \`Bearer \${token}\`,
  }),
  fetcher: fetch,
  onError: (error, context) => {
    if (error instanceof MicroApiError && error.status === 401) {
      console.warn("Unauthorized request", context.url);
    }
  },
});`,
      },
    ],
  },
  {
    id: "headers-overview",
    title: "Headers",
    eyebrow: "Request configuration",
    body: [
      "micro-rq has three places for headers: API-level `headers`, endpoint-level `headers`, and `authHeader`.",
      "Use API-level `headers` for values shared by many requests. Use endpoint-level `headers` when the value depends on endpoint variables. Use `authHeader` only for turning an access token into auth headers.",
    ],
    items: [
      "API headers: app version, locale, tenant, client name.",
      "Endpoint headers: request ID, idempotency key, file metadata, feature-specific headers.",
      "Auth headers: access token headers from `authHeader`.",
      "Header values can be static or computed at request time.",
    ],
    code: [
      {
        code: `export const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  headers: () => ({
    "x-client": "web",
    "accept-language": localStorage.getItem("locale") ?? "en",
  }),
  tokenProvider,
  authHeader: (token) => ({
    Authorization: \`Bearer \${token}\`,
  }),
});`,
      },
    ],
  },
  {
    id: "headers-merge-order",
    title: "Header merge order",
    body: [
      "Headers are merged in one predictable order.",
      "Later headers override earlier headers with the same name. This lets endpoint headers override broad client headers, and auth headers override both when needed.",
    ],
    items: [
      "First: API-level `headers` from `createMicroApi`.",
      "Second: endpoint-level `headers` mapper.",
      "Third: `authHeader` when an access token exists.",
      "Fetch receives a standard `Headers` object.",
    ],
    code: [
      {
        code: `const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  headers: {
    "x-source": "client",
  },
  authHeader: (token) => ({
    Authorization: \`Bearer \${token}\`,
  }),
});

const reports = api.resource("reports", {
  export: api.post<ExportResult, { reportId: string; requestId: string }>(
    ({ reportId }) => \`/reports/\${reportId}/export\`,
    {
      headers: ({ requestId }) => ({
        "x-request-id": requestId,
      }),
    },
  ),
});`,
      },
    ],
  },
  {
    id: "endpoint-headers",
    title: "Endpoint headers",
    body: [
      "Endpoint headers are useful when header values depend on variables passed to that endpoint call.",
      "Keep endpoint-specific headers near the endpoint definition instead of repeating them inside components.",
    ],
    items: [
      "Use for `x-request-id`, `idempotency-key`, tenant overrides, or file metadata.",
      "Return any valid `HeadersInit`: object, array tuples, or `Headers`.",
      "Endpoint headers are merged with API and auth headers automatically.",
    ],
    code: [
      {
        code: `type CreatePaymentInput = {
  amount: number;
  idempotencyKey: string;
};

export const payments = api.resource("payments", {
  create: api.post<Payment, CreatePaymentInput>("/payments", {
    body: ({ amount }) => ({ amount }),
    headers: ({ idempotencyKey }) => ({
      "idempotency-key": idempotencyKey,
    }),
  }),
});`,
      },
    ],
  },
  {
    id: "form-data-upload",
    title: "Uploading files with FormData",
    body: [
      "For common uploads, set `bodyType: \"form-data\"` and return a plain object from the `body` mapper.",
      "micro-rq converts that object to `FormData` automatically.",
      "The endpoint variables can include a `File`, `Blob`, metadata, and any IDs needed to build the path.",
    ],
    items: [
      "Set `bodyType` to `\"form-data\"` for the simple upload case.",
      "Return a plain object from `body`; files and blobs are appended automatically.",
      "Manual `FormData` is still supported for advanced multipart cases.",
      "Use endpoint headers only for metadata headers, not multipart boundaries.",
      "The response type is still the first endpoint generic.",
    ],
    code: [
      {
        code: `type UploadAvatarInput = {
  userId: string;
  file: File;
};

type UploadedAvatar = {
  url: string;
};

export const users = api.resource("users", {
  uploadAvatar: api.post<UploadedAvatar, UploadAvatarInput>(
    ({ userId }) => \`/users/\${userId}/avatar\`,
    {
      bodyType: "form-data",
      body: ({ file }) => ({
        avatar: file,
      }),
    },
  ),
});`,
      },
      {
        code: `const uploadAvatar = useMutation({
  ...users.uploadAvatar.toMutation(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: users.detail.baseKey(),
    });
  },
});

uploadAvatar.mutate({
  userId: "user-1",
  file,
});`,
      },
    ],
  },
  {
    id: "manual-form-data-info",
    title: "Manual FormData is still supported",
    eyebrow: "Info",
    tone: "info",
    body: [
      "You can still create `FormData` manually inside the `body` mapper when the multipart shape is advanced or needs custom field handling.",
      "Use `bodyType: \"form-data\"` for the common case. Use manual `FormData` when you need full control.",
    ],
    code: [
      {
        code: `type UploadGalleryInput = {
  albumId: string;
  cover: File;
  photos: File[];
  caption?: string;
};

export const gallery = api.resource("gallery", {
  upload: api.post<UploadResult, UploadGalleryInput>(
    ({ albumId }) => \`/albums/\${albumId}/gallery\`,
    {
      body: ({ cover, photos, caption }) => {
        const formData = new FormData();
        formData.append("cover", cover);

        for (const photo of photos) {
          formData.append("photos[]", photo);
        }

        if (caption) {
          formData.append("caption", caption);
        }

        return formData;
      },
    },
  ),
});`,
      },
    ],
  },
  {
    id: "form-data-content-type-warning",
    title: "Do not set multipart content-type manually",
    eyebrow: "Warning",
    tone: "warning",
    body: [
      "Do not add `content-type: multipart/form-data` yourself.",
      "When the request body is `FormData`, the browser must add the multipart `boundary`. If you set the header manually, the server may receive an invalid upload body.",
    ],
  },
  {
    id: "upload-progress",
    title: "Upload progress",
    body: [
      "The default browser `fetch` API does not expose upload progress events.",
      "If you need upload progress, keep API definitions outside UI and use a custom upload `fetcher` that writes progress into an app-level store.",
      "Use `api.extend()` when the upload client should inherit the normal API config and only override `name` or `fetcher`.",
      "The component should still use `useMutation()` normally. It can read progress from a small app hook such as `useUploadProgress()`.",
    ],
    items: [
      "`useUploadProgress` is an app hook, not a micro-rq API.",
      "Use `XMLHttpRequest.upload.onprogress` inside the custom fetcher.",
      "Store progress by upload key, endpoint name, or request ID.",
      "TanStack Query still owns mutation pending, success, and error state.",
    ],
    code: [
      {
        code: `// api/upload-progress.ts
import { useSyncExternalStore } from "react";

const progressByKey = new Map<string, number>();
const listeners = new Set<() => void>();

export function setUploadProgress(key: string, percent: number) {
  progressByKey.set(key, percent);
  listeners.forEach((listener) => listener());
}

export function resetUploadProgress(key: string) {
  progressByKey.delete(key);
  listeners.forEach((listener) => listener());
}

export function useUploadProgress(key: string) {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => progressByKey.get(key) ?? 0,
    () => 0,
  );
}`,
      },
      {
        code: `// api/upload-fetcher.ts
import { setUploadProgress } from "./upload-progress";

export function createUploadFetcher(progressKey: string): typeof fetch {
  return (input, init) =>
    new Promise<Response>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(init?.method ?? "GET", String(input));

      new Headers(init?.headers).forEach((value, key) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(progressKey, Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        resolve(
          new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: {
              "content-type": xhr.getResponseHeader("content-type") ?? "text/plain",
            },
          }),
        );
      };

      xhr.onerror = () => reject(new TypeError("Upload failed"));
      xhr.send(init?.body ?? null);
    });
}`,
      },
      {
        code: `// api/uploads.ts
import { api } from "./api";
import { createUploadFetcher } from "./upload-fetcher";

export type UploadAvatarInput = {
  file: File;
};

export type UploadedAvatar = {
  url: string;
};

export const uploadApi = api.extend({
  name: "uploads",
  fetcher: createUploadFetcher("avatar"),
});

export const uploads = uploadApi.resource("uploads", {
  avatar: uploadApi.post<UploadedAvatar, UploadAvatarInput>(
    "/uploads/avatar",
    {
      bodyType: "form-data",
      body: ({ file }) => ({
        avatar: file,
      }),
    },
  ),
});`,
      },
      {
        code: `// components/AvatarUploader.tsx
import { useMutation } from "@tanstack/react-query";
import { resetUploadProgress, useUploadProgress } from "../api/upload-progress";
import { uploads } from "../api/uploads";

export function AvatarUploader() {
  const progress = useUploadProgress("avatar");

  const uploadAvatar = useMutation({
    ...uploads.avatar.toMutation(),
    onMutate: () => resetUploadProgress("avatar"),
    onSuccess: () => {
      // Upload completed. You can invalidate related queries here.
    },
    onError: () => resetUploadProgress("avatar"),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        const file = new FormData(event.currentTarget).get("file");

        if (file instanceof File) {
          uploadAvatar.mutate({ file });
        }
      }}
    >
      <input name="file" type="file" />
      <button disabled={uploadAvatar.isPending} type="submit">
        Upload
      </button>

      {uploadAvatar.isPending ? (
        <progress max={100} value={progress}>
          {progress}%
        </progress>
      ) : null}
    </form>
  );
}`,
      },
    ],
  },
  {
    id: "auth-overview",
    title: "Authentication overview",
    body: [
      "Authentication is optional.",
      "If your API needs auth, create a token provider and pass it to `createMicroApi`.",
      "The token provider is the small object that knows where your tokens live and how to refresh them.",
    ],
  },
  {
    id: "token-provider",
    title: "Create a token provider",
    body: [
      "`createTokenProvider` keeps auth logic in one place.",
      "It reads the current access token, can call your refresh endpoint, and lets you save or clear tokens after refresh.",
      "When several requests receive `401` at the same time, they share one refresh call instead of starting many refresh requests.",
    ],
    items: [
      "`getAccessToken` returns the current access token or `null`.",
      "`getRefreshToken` returns the refresh token when your refresh flow needs one.",
      "`refresh.fn` calls your refresh endpoint.",
      "`refresh.selectAccessToken` picks the new access token from the refresh response.",
      "`refresh.onSuccess` is where you save returned tokens.",
      "`refresh.onError` is where you clear auth state or notify the app.",
    ],
    code: [
      {
        code: `import { createTokenProvider } from "micro-rq";

export const tokenProvider = createTokenProvider({
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  refresh: {
    fn: async ({ refreshToken }) => {
      const { auth } = await import("./auth");

      return auth.refresh.fn({ refreshToken });
    },
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
});`,
      },
      {
        code: `import { createMicroApi } from "micro-rq";
import { tokenProvider } from "./token-provider";

export const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  tokenProvider,
  authHeader: (token) => ({
    Authorization: \`Bearer \${token}\`,
  }),
});`,
      },
      {
        code: `import { api } from "./api";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const auth = api.resource("auth", {
  refresh: api.post<AuthTokens, { refreshToken?: string | null }>("/auth/refresh", {
    authMode: "none",
  }),
});`,
      },
    ],
  },
  {
    id: "auth-refresh-warning",
    title: "Refresh endpoint warning",
    eyebrow: "Warning",
    tone: "warning",
    body: [
      "A refresh request should not trigger the same refresh flow again.",
      "If your refresh endpoint uses the same authenticated `api`, set that endpoint to `authMode: \"none\"`.",
      "Without that, a failed refresh request can try to refresh itself and create a loop.",
      "If the refresh endpoint needs its own auth behavior, put it on a separate API client.",
    ],
    code: [
      {
        code: `export const publicApi = createMicroApi({
  name: "public",
  baseUrl: "/api",
});

export const auth = publicApi.resource("auth", {
  refresh: publicApi.post<AuthTokens, { refreshToken?: string | null }>(
    "/auth/refresh",
    {
      // Use "optional" or "required" when this refresh endpoint
      // has its own auth behavior and cannot be authMode: "none".
      authMode: "optional",
    },
  ),
});`,
      },
    ],
  },
  {
    id: "auth-client",
    title: "Attach auth to the API client",
    body: [
      "After creating the token provider, attach it to your API client.",
      "Use `authHeader` to turn the access token into request headers.",
      "Most APIs use a Bearer token, but you can return any header shape your backend expects.",
    ],
    code: [
      {
        code: `export const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  tokenProvider,
  authHeader: (token) => ({
    Authorization: \`Bearer \${token}\`,
  }),
});`,
      },
    ],
  },
  {
    id: "auth-modes",
    title: "Endpoint auth modes",
    body: [
      "Each endpoint can choose how it uses auth.",
      "`optional` is the default. It uses a token when one exists, but still allows the request without one.",
      "Use `none` for endpoints like login and refresh.",
      "Use `required` when the request must have a token before fetch runs.",
    ],
    items: [
      "`optional` uses a token when one exists.",
      "`required` throws `MicroAuthRequiredError` before fetch when no token exists.",
      "`none` skips token lookup, auth headers, and refresh-on-401.",
    ],
    code: [
      {
        code: `export const auth = api.resource("auth", {
  login: api.post<LoginResponse, LoginDto>("/auth/login", {
    authMode: "none",
  }),
  profile: api.get<AuthUser>("/auth/profile", {
    // Optional is the default value; this line can be omitted.
    authMode: "optional",
  }),
  me: api.get<AuthUser>("/auth/me", {
    authMode: "required",
  }),
});`,
      },
    ],
  },
  {
    id: "errors",
    title: "Errors",
    body: [
      "Failed HTTP responses throw `MicroApiError`.",
      "Missing required auth throws `MicroAuthRequiredError` before fetch is called.",
      "Network errors, refresh errors, and JSON parsing errors are thrown as their original errors.",
    ],
    items: [
      "MicroApiError.status: response status number.",
      "MicroApiError.statusText: response status text.",
      "MicroApiError.data: parsed error body, text, or `null`.",
      "MicroApiError.response: original `Response` object.",
    ],
    code: [
      {
        code: `import { MicroApiError, MicroAuthRequiredError } from "micro-rq";

try {
  await users.detail.fn("user-1")();
} catch (error) {
  if (error instanceof MicroApiError) {
    console.log(error.status, error.data);
  }

  if (error instanceof MicroAuthRequiredError) {
    console.log("The user must sign in first.");
  }
}`,
      },
    ],
  },
  {
    id: "on-error",
    title: "Global error observer",
    body: [
      "`onError` lets the API client observe request failures without replacing the original error.",
      "Use it for logging, telemetry, or auth cleanup. TanStack Query still receives the original thrown error.",
    ],
    code: [
      {
        code: `const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  onError: (error, context) => {
    console.log(context.method, context.url, error);
  },
});`,
      },
    ],
  },
  {
    id: "status-401",
    title: "Handling 401 Unauthorized",
    body: [
      "For endpoints with `authMode: \"optional\"` or `authMode: \"required\"`, a `401` automatically triggers `tokenProvider.refreshAccessToken()` when refresh is configured.",
      "micro-rq retries the original request once after refresh succeeds. If the retry still returns `401`, the final `MicroApiError` is thrown to TanStack Query and observed by `onError`.",
      "Use global `onError` for auth cleanup after the final failure. Do not clear tokens on the first `401`; micro-rq may still be able to refresh and retry.",
    ],
    items: [
      "Auto refresh happens only for `401`.",
      "Auto refresh does not run when the endpoint uses `authMode: \"none\"`.",
      "The request is retried once, not forever.",
      "After the final failure, TanStack Query receives the original `MicroApiError`.",
    ],
    code: [
      {
        code: `const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  tokenProvider,
  authHeader: (token) => ({
    Authorization: \`Bearer \${token}\`,
  }),
  onError: (error, context) => {
    if (error instanceof MicroApiError && error.status === 401) {
      // This is the final 401 after refresh/retry failed.
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      if (context.authMode === "required") {
        router.navigate("/login");
      }
    }
  },
});`,
      },
      {
        code: `const meQuery = useQuery({
  ...auth.me.toQuery(),
  retry: false,
  onError: (error) => {
    if (error instanceof MicroApiError && error.status === 401) {
      toast.error("Your session expired. Please sign in again.");
    }
  },
});`,
      },
    ],
  },
  {
    id: "status-403",
    title: "Handling 403 Forbidden",
    body: [
      "`403` means the request was authenticated, but the user is not allowed to perform that action.",
      "micro-rq does not refresh the token for `403`. Refreshing usually will not help because the access token is valid but lacks permission.",
      "Handle `403` as an authorization or permissions problem: show an access-denied state, redirect to a safe page, or hide unavailable actions.",
    ],
    items: [
      "401: authentication problem; refresh may help.",
      "403: authorization problem; refresh normally should not run.",
      "Use TanStack Query `onError` for page-specific UI behavior.",
      "Use global `onError` for telemetry or central permission logging.",
    ],
    code: [
      {
        code: `const deleteUser = useMutation({
  ...users.remove.toMutation(),
  onError: (error) => {
    if (error instanceof MicroApiError && error.status === 403) {
      toast.error("You do not have permission to delete this user.");
    }
  },
});`,
      },
    ],
  },
  {
    id: "manual-refresh",
    title: "Forcing a token refresh",
    body: [
      "Automatic refresh is tied to `401` responses. If you need to refresh before a request, call `tokenProvider.refreshAccessToken()` manually.",
      "This is useful before a sensitive action, before opening a long-lived screen, or after the app becomes active again.",
      "After manual refresh succeeds, invalidate or refetch the queries that should use the new access token.",
    ],
    items: [
      "Manual refresh uses the same shared refresh promise, so parallel calls still share one refresh request.",
      "Manual refresh throws if refresh is not configured or refresh fails.",
      "Use `queryClient.invalidateQueries()` after refresh when existing cached data should be reloaded.",
    ],
    code: [
      {
        code: `async function refreshSession() {
  await tokenProvider.refreshAccessToken();

  await queryClient.invalidateQueries({
    queryKey: auth.me.baseKey(),
  });
}`,
      },
      {
        code: `const saveSettings = useMutation({
  mutationFn: async (values: SettingsDto) => {
    await tokenProvider.refreshAccessToken();

    return settings.update.fn(values);
  },
});`,
      },
    ],
  },
  {
    id: "response-parsing",
    title: "Response parsing",
    body: ["Successful responses are parsed before they are returned from `queryFn`, `mutationFn`, or `fn()`."],
    items: [
      "204 responses return `undefined`.",
      "Empty successful bodies return `undefined`.",
      "JSON content types are parsed with `JSON.parse`.",
      "Non-JSON bodies return text.",
      "Empty error bodies become `null` on `MicroApiError.data`.",
    ],
  },
  {
    id: "typescript",
    title: "TypeScript behavior",
    body: [
      "Endpoint generics flow into query functions, mutation functions, and direct request functions.",
      "No-variable endpoints expose zero-argument helpers, so callers do not need to pass `undefined`.",
      "`toQuery()` and `toMutation()` return structural config types, so they remain assignable to TanStack Query even in monorepos or linked examples with more than one physical `@tanstack/react-query` install.",
    ],
    code: [
      {
        code: `const me = api.resource("me", {
  get: api.get<User>("/me"),
});

me.get.toQuery();
me.get.key();
me.get.fn();

const detail = users.detail.toQuery("user-1");
// detail.queryFn returns Promise<User>.`,
      },
    ],
  },
  {
    id: "exports",
    title: "Public exports",
    body: ["The root package exports runtime helpers, error classes, and TypeScript types."],
    items: [
      "Runtime: `createMicroApi`, `createTokenProvider`, `MicroApiError`, `MicroAuthRequiredError`.",
      "Endpoint types: `QueryEndpoint`, `MutationEndpoint`, `QueryConfig`, `MutationConfig`, `BuiltResource`, `VariablesArgs`.",
      "Config types: `CreateMicroApiConfig`, `RequestMappers`, `BodyType`, `PathBuilder`, `AuthMode`, `HttpMethod`, `MicroRequestContext`.",
      "Auth and key types: `TokenProvider`, `TokenProviderConfig`, `MaybePromise`, `MicroApi`, `MicroQueryKey`.",
    ],
  },
  {
    id: "api-reference",
    title: "Core API shapes",
    body: ["These are the main public config shapes. Most users only need them when typing reusable helpers."],
    code: [
      {
        code: `type CreateMicroApiConfig = {
  name: string;
  baseUrl: string;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  tokenProvider?: TokenProvider;
  authHeader?: (token: string) => HeadersInit;
  fetcher?: typeof fetch;
  onError?: (error: unknown, context: MicroRequestContext) => void | Promise<void>;
};

type RequestMappers<TVariables> = {
  query?: (variables: TVariables) => Record<string, unknown>;
  body?: (variables: TVariables) => unknown;
  bodyType?: "json" | "form-data";
  headers?: (variables: TVariables) => HeadersInit;
  authMode?: "none" | "optional" | "required";
};

type MicroApi = {
  extend: (overrides: Partial<CreateMicroApiConfig>) => MicroApi;
  // Also includes get, post, put, patch, delete, and resource helpers.
};`,
      },
    ],
  },
  {
    id: "example-app",
    title: "Example app",
    body: [
      "The repository includes a structured Next.js App Router example app using DummyJSON.",
      "It demonstrates server prefetch/hydration, product list/detail pages, login, protected routes, automatic refresh-token retry, infinite posts, mutations, upload, and error handling.",
    ],
    code: [
      {
        code: `cd examples/next
npm install
npm run dev`,
      },
    ],
  },
  {
    id: "next-ssr-hydration",
    title: "Next.js SSR hydration",
    body: [
      "In Server Components, pass the generated query config directly to TanStack Query's `prefetchQuery`.",
      "Then wrap the Client Component with `HydrationBoundary`. The client can call `useQuery` with the same endpoint config and read the prefetched data from the cache.",
      "This is usually better than manually passing `initialData` props because the data is stored under the exact generated query key.",
    ],
    code: [
      {
        code: `// app/products/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { products } from "../api/resources/products";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const queryClient = new QueryClient();
  const params = {
    limit: 12,
    skip: 0,
  };

  await queryClient.prefetchQuery(products.list.toQuery(params));
  await queryClient.prefetchQuery(products.categoryList.toQuery());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsClient params={params} />
    </HydrationBoundary>
  );
}`,
      },
      {
        code: `// app/products/products-client.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { products } from "../api/resources/products";

export function ProductsClient({ params }: { params: { limit: number; skip: number } }) {
  const productsQuery = useQuery({
    ...products.list.toQuery(params),
  });

  const categoriesQuery = useQuery({
    ...products.categoryList.toQuery(),
  });

  // Render productsQuery.data and categoriesQuery.data.
}`,
      },
    ],
  },
];

export const pages: DocPage[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "Learn what micro-rq solves, then define and use your first REST resource.",
    sectionIds: ["what-is", "problem", "install", "step-client", "step-resource", "step-query", "step-mutation"],
  },
  {
    slug: "core-concepts",
    title: "Core Concepts",
    description: "Understand the client, resources, endpoints, path variables, generated keys, and invalidation.",
    sectionIds: [
      "mental-model",
      "paths",
      "path-function-variables-info",
      "keys",
      "invalidation",
    ],
  },
  {
    slug: "api-client",
    title: "API Client",
    description: "Configure every createMicroApi option, including headers, authHeader, fetcher, and onError.",
    sectionIds: [
      "client-options-overview",
      "client-name-baseurl",
      "client-headers",
      "client-auth-header",
      "client-token-provider-note",
      "client-fetcher",
      "client-extend",
      "client-on-error",
    ],
  },
  {
    slug: "resources",
    title: "Resources",
    description: "Group related endpoints under stable domain names such as users, auth, products, or orders.",
    sectionIds: [
      "resource-overview",
    ],
  },
  {
    slug: "endpoints",
    title: "Endpoints",
    description: "Define request paths, variables, mappers, query helpers, and mutation helpers.",
    sectionIds: [
      "resource-definition",
      "resource-generics",
      "resource-paths",
      "query-string-warning",
      "resource-request-mappers",
      "query-serialization",
      "body-headers",
      "json-content-type-info",
      "resource-query-endpoints",
      "resource-mutation-endpoints",
      "resource-complete-example",
    ],
  },
  {
    slug: "headers",
    title: "Headers",
    description: "Configure API headers, endpoint headers, merge order, and header-related request behavior.",
    sectionIds: [
      "headers-overview",
      "headers-merge-order",
      "endpoint-headers",
    ],
  },
  {
    slug: "uploads",
    title: "Uploads",
    description: "Send FormData, upload files, and track upload progress with a custom fetcher.",
    sectionIds: [
      "form-data-upload",
      "manual-form-data-info",
      "form-data-content-type-warning",
      "upload-progress",
    ],
  },
  {
    slug: "auth",
    title: "Authentication",
    description: "Read tokens, refresh expired sessions, attach auth headers, and choose auth behavior per endpoint.",
    sectionIds: ["auth-overview", "token-provider", "auth-refresh-warning", "auth-client", "auth-modes"],
  },
  {
    slug: "errors",
    title: "Errors",
    description: "Handle failed responses, missing auth, response parsing, and global error observation.",
    sectionIds: ["errors", "on-error", "status-401", "status-403", "manual-refresh", "response-parsing"],
  },
  {
    slug: "reference",
    title: "API Reference",
    description: "Review TypeScript behavior, public exports, core config shapes, and the example app.",
    sectionIds: ["typescript", "exports", "api-reference", "client-complete-example", "next-ssr-hydration", "example-app"],
  },
];

export const defaultPage = pages[0];

export function getPage(slug: string): DocPage | undefined {
  return pages.find((page) => page.slug === slug);
}

export function getPageSections(page: DocPage): DocSection[] {
  return page.sectionIds
    .map((sectionId) => sections.find((section) => section.id === sectionId))
    .filter((section): section is DocSection => Boolean(section));
}
