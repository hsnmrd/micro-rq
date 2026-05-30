import { QueryKey, QueryFunction, MutationFunction } from '@tanstack/react-query';

type MaybePromise<T> = T | Promise<T>;
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type AuthMode = "none" | "optional" | "required";
type PathBuilder<TVariables> = string | ((variables: TVariables) => string);
type RequestMappers<TVariables> = {
    query?: (variables: TVariables) => Record<string, unknown>;
    body?: (variables: TVariables) => unknown;
    headers?: (variables: TVariables) => HeadersInit;
    authMode?: AuthMode;
};
type MicroRequestContext = {
    method: HttpMethod;
    path: string;
    url: string;
    authMode: AuthMode;
};
type TokenProviderConfig<TTokens = unknown> = {
    getAccessToken: () => MaybePromise<string | null>;
    getRefreshToken?: () => MaybePromise<string | null>;
    refresh?: (input: {
        refreshToken?: string | null;
    }) => Promise<TTokens>;
    getAccessTokenFromRefreshResult?: (tokens: TTokens) => string;
    onRefreshSuccess?: (tokens: TTokens) => MaybePromise<void>;
    onRefreshFailed?: (error: unknown) => MaybePromise<void>;
};
type TokenProvider<TTokens = unknown> = {
    getAccessToken: () => Promise<string | null>;
    refreshAccessToken: () => Promise<TTokens>;
    hasRefresh: () => boolean;
};
type CreateMicroApiConfig = {
    name: string;
    baseUrl: string;
    headers?: HeadersInit | (() => MaybePromise<HeadersInit>);
    tokenProvider?: TokenProvider;
    authHeader?: (token: string) => HeadersInit;
    fetcher?: typeof fetch;
    onError?: (error: unknown, context: MicroRequestContext) => MaybePromise<void>;
};

type VariablesArgs<TVariables> = [TVariables] extends [void] ? [] : [variables: TVariables];
type QueryBuildResult<TData> = {
    queryKey: QueryKey;
    queryFn: QueryFunction<TData, QueryKey>;
};
type MutationBuildResult<TData, TVariables> = {
    mutationFn: MutationFunction<TData, TVariables>;
};
type QueryEndpoint<TData, TVariables = void> = {
    baseKey: () => QueryKey;
    key: (...args: VariablesArgs<TVariables>) => QueryKey;
    fn: (...args: VariablesArgs<TVariables>) => () => Promise<TData>;
    build: (...args: VariablesArgs<TVariables>) => QueryBuildResult<TData>;
};
type MutationEndpoint<TData, TVariables = void> = {
    fn: (...args: VariablesArgs<TVariables>) => Promise<TData>;
    build: () => MutationBuildResult<TData, TVariables>;
};
type PendingQueryEndpoint<TData, TVariables> = {
    readonly kind: "query";
    readonly method: "GET";
    readonly path: PathBuilder<TVariables>;
    readonly mappers?: RequestMappers<TVariables>;
};
type PendingMutationEndpoint<TData, TVariables> = {
    readonly kind: "mutation";
    readonly method: Exclude<HttpMethod, "GET">;
    readonly path: PathBuilder<TVariables>;
    readonly mappers?: RequestMappers<TVariables>;
};
type PendingEndpoint<TData = unknown, TVariables = unknown> = PendingQueryEndpoint<TData, TVariables> | PendingMutationEndpoint<TData, TVariables>;
type BuiltEndpoint<TEndpoint> = TEndpoint extends PendingQueryEndpoint<infer TData, infer TVariables> ? QueryEndpoint<TData, TVariables> : TEndpoint extends PendingMutationEndpoint<infer TData, infer TVariables> ? MutationEndpoint<TData, TVariables> : never;
type ResourceDefinition = Record<string, PendingEndpoint<any, any>>;
type BuiltResource<TDefinition extends ResourceDefinition> = {
    readonly [K in keyof TDefinition]: BuiltEndpoint<TDefinition[K]>;
};

declare function createMicroApi(config: CreateMicroApiConfig): {
    get: {
        <TData>(path: string): PendingQueryEndpoint<TData, void>;
        <TData>(path: string, mappers: RequestMappers<void>): PendingQueryEndpoint<TData, void>;
        <TData, TVariables>(path: PathBuilder<TVariables>, mappers?: RequestMappers<TVariables>): PendingQueryEndpoint<TData, TVariables>;
    };
    post: {
        <TData>(path: string): PendingMutationEndpoint<TData, void>;
        <TData>(path: string, mappers: RequestMappers<void>): PendingMutationEndpoint<TData, void>;
        <TData, TVariables>(path: PathBuilder<TVariables>, mappers?: RequestMappers<TVariables>): PendingMutationEndpoint<TData, TVariables>;
    };
    put: {
        <TData>(path: string): PendingMutationEndpoint<TData, void>;
        <TData>(path: string, mappers: RequestMappers<void>): PendingMutationEndpoint<TData, void>;
        <TData, TVariables>(path: PathBuilder<TVariables>, mappers?: RequestMappers<TVariables>): PendingMutationEndpoint<TData, TVariables>;
    };
    patch: {
        <TData>(path: string): PendingMutationEndpoint<TData, void>;
        <TData>(path: string, mappers: RequestMappers<void>): PendingMutationEndpoint<TData, void>;
        <TData, TVariables>(path: PathBuilder<TVariables>, mappers?: RequestMappers<TVariables>): PendingMutationEndpoint<TData, TVariables>;
    };
    delete: {
        <TData>(path: string): PendingMutationEndpoint<TData, void>;
        <TData>(path: string, mappers: RequestMappers<void>): PendingMutationEndpoint<TData, void>;
        <TData, TVariables>(path: PathBuilder<TVariables>, mappers?: RequestMappers<TVariables>): PendingMutationEndpoint<TData, TVariables>;
    };
    resource: <TDefinition extends ResourceDefinition>(resourceName: string, definition: TDefinition) => BuiltResource<TDefinition>;
};

declare function createTokenProvider<TTokens = unknown>(config: TokenProviderConfig<TTokens>): TokenProvider<TTokens>;

declare class MicroApiError extends Error {
    readonly status: number;
    readonly statusText: string;
    readonly data: unknown;
    readonly response: Response;
    constructor(response: Response, data: unknown);
}
declare class MicroAuthRequiredError extends Error {
    constructor();
}

export { type AuthMode, type BuiltResource, type CreateMicroApiConfig, type HttpMethod, MicroApiError, MicroAuthRequiredError, type MicroRequestContext, type MutationBuildResult, type MutationEndpoint, type PathBuilder, type QueryBuildResult, type QueryEndpoint, type RequestMappers, type TokenProvider, type TokenProviderConfig, type VariablesArgs, createMicroApi, createTokenProvider };
