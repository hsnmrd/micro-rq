import type {
  PendingMutationEndpoint,
  PendingQueryEndpoint,
  ResourceDefinition,
} from "./endpoint-types";
import { createFetchClient } from "./fetch-client";
import { createPendingEndpoint, createResource } from "./resource";
import type { CreateMicroApiConfig, PathBuilder, RequestMappers } from "./types";

export type MicroApi = ReturnType<typeof createMicroApi>;

export function createMicroApi(config: CreateMicroApiConfig) {
  const fetchClient = createFetchClient(config);

  return {
    get: createQueryFactory(),
    post: createMutationFactory("POST"),
    put: createMutationFactory("PUT"),
    patch: createMutationFactory("PATCH"),
    delete: createMutationFactory("DELETE"),
    resource: <TDefinition extends ResourceDefinition>(resourceName: string, definition: TDefinition) =>
      createResource(config.name, resourceName, definition, fetchClient),
  };
}

function createQueryFactory() {
  function get<TData>(path: string): PendingQueryEndpoint<TData, void>;
  function get<TData>(path: string, mappers: RequestMappers<void>): PendingQueryEndpoint<TData, void>;
  function get<TData, TVariables>(
    path: PathBuilder<TVariables>,
    mappers?: RequestMappers<TVariables>,
  ): PendingQueryEndpoint<TData, TVariables>;
  function get<TData, TVariables>(
    path: PathBuilder<TVariables>,
    mappers?: RequestMappers<TVariables>,
  ): PendingQueryEndpoint<TData, TVariables> {
    return createPendingEndpoint<TData, TVariables>("query", "GET", path, mappers) as PendingQueryEndpoint<
      TData,
      TVariables
    >;
  }

  return get;
}

function createMutationFactory(method: "POST" | "PUT" | "PATCH" | "DELETE") {
  function mutation<TData>(path: string): PendingMutationEndpoint<TData, void>;
  function mutation<TData>(path: string, mappers: RequestMappers<void>): PendingMutationEndpoint<TData, void>;
  function mutation<TData, TVariables>(
    path: PathBuilder<TVariables>,
    mappers?: RequestMappers<TVariables>,
  ): PendingMutationEndpoint<TData, TVariables>;
  function mutation<TData, TVariables>(
    path: PathBuilder<TVariables>,
    mappers?: RequestMappers<TVariables>,
  ): PendingMutationEndpoint<TData, TVariables> {
    return createPendingEndpoint<TData, TVariables>("mutation", method, path, mappers) as PendingMutationEndpoint<
      TData,
      TVariables
    >;
  }

  return mutation;
}
