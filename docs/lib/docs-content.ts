export type CodeBlock = {
  code: string;
};

export type DocSection = {
  id: string;
  title: string;
  eyebrow?: string;
  body: string[];
  code?: CodeBlock[];
  items?: string[];
};

export const sections: DocSection[] = [
  {
    id: "overview",
    title: "Generate core TanStack Query config without wrapping TanStack Query.",
    eyebrow: "Typed REST resources",
    body: [
      "micro-rq handles base URLs, headers, token injection, token refresh, REST resource definitions, generated query keys, query functions, and mutation functions.",
      "React Query options stay visible and native inside useQuery and useMutation.",
    ],
    items: [
      "No generated React hooks.",
      "No custom cache layer.",
      "No wrapped useQuery or useMutation.",
      "No hidden enabled, staleTime, retry, select, or onSuccess options.",
    ],
  },
  {
    id: "install",
    title: "Installation",
    body: ["Install micro-rq with TanStack Query. TanStack Query is a peer dependency."],
    code: [
      {
        code: "npm install micro-rq @tanstack/react-query",
      },
    ],
  },
  {
    id: "quickstart",
    title: "Quickstart",
    body: ["Create one API client, define resources, and spread generated config into TanStack Query."],
    code: [
      {
        code: `import { createMicroApi } from "micro-rq";

const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
});

type User = {
  id: string;
  name: string;
};

export const users = api.resource("users", {
  list: api.get<User[]>("/users"),
  detail: api.get<User, string>((id) => \`/users/\${id}\`),
  create: api.post<User, { name: string }>("/users"),
});`,
      },
    ],
  },
  {
    id: "queries",
    title: "Queries",
    body: ["Query endpoints generate queryKey and queryFn only. React Query options stay beside the hook call."],
    code: [
      {
        code: `useQuery({
  ...users.detail.build(userId),
  enabled: !!userId,
  staleTime: 60_000,
  select: (user) => user.name,
});`,
      },
      {
        code: `users.detail.key("user-1");
// ["main", "users", "detail", "user-1"]

users.detail.baseKey();
// ["main", "users", "detail"]`,
      },
    ],
  },
  {
    id: "mutations",
    title: "Mutations",
    body: ["Mutation endpoints generate mutationFn only. Variables are passed to mutate, not build."],
    code: [
      {
        code: `const createUser = useMutation({
  ...users.create.build(),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: users.list.baseKey(),
    });
  },
});

createUser.mutate({
  name: "John",
});`,
      },
    ],
  },
  {
    id: "auth",
    title: "Authentication",
    body: [
      "createTokenProvider coordinates token lookup, refresh token lookup, refresh calls, and callbacks.",
      "Endpoint authMode controls how each request uses auth.",
    ],
    items: [
      "optional: default. Use a token if one exists, but allow the request without one.",
      "required: require an access token before fetch; throw MicroAuthRequiredError when missing.",
      "none: skip token lookup, auth headers, and refresh-on-401.",
    ],
    code: [
      {
        code: `export const auth = api.resource("auth", {
  login: api.post<LoginResponse, LoginDto>("/auth/login", {
    authMode: "none",
  }),
  refresh: api.post<AuthTokens, RefreshDto>("/auth/refresh", {
    authMode: "none",
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
    title: "Error Handling",
    body: [
      "Failed responses throw MicroApiError. Missing required auth throws MicroAuthRequiredError.",
      "Use onError to observe failures at the API-client level. The original error is still thrown for TanStack Query.",
    ],
    code: [
      {
        code: `const api = createMicroApi({
  name: "main",
  baseUrl: "/api",
  onError: (error, context) => {
    if (error instanceof MicroApiError && error.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }

    console.log(context.method, context.url);
  },
});`,
      },
    ],
  },
  {
    id: "api",
    title: "API Reference",
    body: ["The public API intentionally stays small."],
    items: [
      "createMicroApi(config): creates HTTP builders and resource().",
      "createTokenProvider(config): creates a coordinated token provider.",
      "MicroApiError: thrown for non-2xx responses.",
      "MicroAuthRequiredError: thrown before fetch for missing required auth.",
    ],
  },
  {
    id: "next",
    title: "Next.js Example",
    body: ["The repository includes a runnable Next.js App Router example using DummyJSON."],
    code: [
      {
        code: `cd examples/react-vite
npm install
npm run dev`,
      },
    ],
  },
];
