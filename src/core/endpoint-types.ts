import type { QueryFunction, QueryKey, MutationFunction } from "@tanstack/react-query";
import type { FetchClient } from "./fetch-client";
import type { HttpMethod, PathBuilder, RequestMappers } from "./types";

export type VariablesArgs<TVariables> = [TVariables] extends [void]
  ? []
  : [variables: TVariables];

export type QueryBuildResult<TData> = {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData, QueryKey>;
};

export type MutationBuildResult<TData, TVariables> = {
  mutationFn: MutationFunction<TData, TVariables>;
};

export type QueryEndpoint<TData, TVariables = void> = {
  baseKey: () => QueryKey;
  key: (...args: VariablesArgs<TVariables>) => QueryKey;
  fn: (...args: VariablesArgs<TVariables>) => () => Promise<TData>;
  build: (...args: VariablesArgs<TVariables>) => QueryBuildResult<TData>;
};

export type MutationEndpoint<TData, TVariables = void> = {
  fn: (...args: VariablesArgs<TVariables>) => Promise<TData>;
  build: () => MutationBuildResult<TData, TVariables>;
};

export type PendingQueryEndpoint<TData, TVariables> = {
  readonly kind: "query";
  readonly method: "GET";
  readonly path: PathBuilder<TVariables>;
  readonly mappers?: RequestMappers<TVariables>;
};

export type PendingMutationEndpoint<TData, TVariables> = {
  readonly kind: "mutation";
  readonly method: Exclude<HttpMethod, "GET">;
  readonly path: PathBuilder<TVariables>;
  readonly mappers?: RequestMappers<TVariables>;
};

export type PendingEndpoint<TData = unknown, TVariables = unknown> =
  | PendingQueryEndpoint<TData, TVariables>
  | PendingMutationEndpoint<TData, TVariables>;

export type BuiltEndpoint<TEndpoint> =
  TEndpoint extends PendingQueryEndpoint<infer TData, infer TVariables>
    ? QueryEndpoint<TData, TVariables>
    : TEndpoint extends PendingMutationEndpoint<infer TData, infer TVariables>
      ? MutationEndpoint<TData, TVariables>
      : never;

export type ResourceDefinition = Record<string, PendingEndpoint<any, any>>;

export type BuiltResource<TDefinition extends ResourceDefinition> = {
  readonly [K in keyof TDefinition]: BuiltEndpoint<TDefinition[K]>;
};

export type EndpointContext = {
  apiName: string;
  resourceName: string;
  endpointName: string;
  fetchClient: FetchClient;
};
