import type { FetchClient } from "./fetch-client";
import type { MicroQueryKey } from "./keys";
import type { HttpMethod, PathBuilder, RequestMappers } from "./types";

export type VariablesArgs<TVariables> = [TVariables] extends [void]
  ? []
  : [variables: TVariables];

export type QueryConfig<TData> = {
  queryKey: MicroQueryKey;
  queryFn: () => Promise<TData>;
};

export type MutationConfig<TData, TVariables> = {
  mutationFn: (...args: VariablesArgs<TVariables>) => Promise<TData>;
};

export type QueryEndpoint<TData, TVariables = void> = {
  baseKey: () => MicroQueryKey;
  key: (...args: VariablesArgs<TVariables>) => MicroQueryKey;
  fn: (...args: VariablesArgs<TVariables>) => () => Promise<TData>;
  toQuery: (...args: VariablesArgs<TVariables>) => QueryConfig<TData>;
};

export type MutationEndpoint<TData, TVariables = void> = {
  fn: (...args: VariablesArgs<TVariables>) => Promise<TData>;
  toMutation: () => MutationConfig<TData, TVariables>;
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
