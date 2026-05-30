export type MaybePromise<T> = T | Promise<T>;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type AuthMode = "none" | "optional" | "required";

export type PathBuilder<TVariables> = string | ((variables: TVariables) => string);

export type RequestMappers<TVariables> = {
  query?: (variables: TVariables) => Record<string, unknown>;
  body?: (variables: TVariables) => unknown;
  headers?: (variables: TVariables) => HeadersInit;
  authMode?: AuthMode;
};

export type MicroRequestContext = {
  method: HttpMethod;
  path: string;
  url: string;
  authMode: AuthMode;
};

export type TokenProviderConfig<TTokens = unknown> = {
  getAccessToken: () => MaybePromise<string | null>;
  getRefreshToken?: () => MaybePromise<string | null>;
  refresh?: (input: { refreshToken?: string | null }) => Promise<TTokens>;
  getAccessTokenFromRefreshResult?: (tokens: TTokens) => string;
  onRefreshSuccess?: (tokens: TTokens) => MaybePromise<void>;
  onRefreshFailed?: (error: unknown) => MaybePromise<void>;
};

export type TokenProvider<TTokens = unknown> = {
  getAccessToken: () => Promise<string | null>;
  refreshAccessToken: () => Promise<TTokens>;
  hasRefresh: () => boolean;
};

export type CreateMicroApiConfig = {
  name: string;
  baseUrl: string;
  headers?: HeadersInit | (() => MaybePromise<HeadersInit>);
  tokenProvider?: TokenProvider;
  authHeader?: (token: string) => HeadersInit;
  fetcher?: typeof fetch;
  onError?: (error: unknown, context: MicroRequestContext) => MaybePromise<void>;
};

export type RequestInput<TVariables> = {
  method: HttpMethod;
  path: PathBuilder<TVariables>;
  variables: TVariables;
  mappers?: RequestMappers<TVariables>;
};
