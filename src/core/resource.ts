import type {
  BuiltResource,
  EndpointContext,
  PendingEndpoint,
  PendingMutationEndpoint,
  PendingQueryEndpoint,
  ResourceDefinition,
} from "./endpoint-types";
import { createBaseKey, createQueryKey } from "./keys";

export function createResource<TDefinition extends ResourceDefinition>(
  apiName: string,
  resourceName: string,
  definition: TDefinition,
  fetchClient: EndpointContext["fetchClient"],
): BuiltResource<TDefinition> {
  const resource = {} as BuiltResource<TDefinition>;

  for (const endpointName of Object.keys(definition) as Array<keyof TDefinition & string>) {
    const endpoint = definition[endpointName]!;
    const context = { apiName, resourceName, endpointName, fetchClient };

    Object.defineProperty(resource, endpointName, {
      value: endpoint.kind === "query" ? buildQueryEndpoint(endpoint, context) : buildMutationEndpoint(endpoint, context),
      enumerable: true,
      configurable: false,
      writable: false,
    });
  }

  return resource;
}

function buildQueryEndpoint<TData, TVariables>(
  endpoint: PendingQueryEndpoint<TData, TVariables>,
  context: EndpointContext,
) {
  const hasVariables = typeof endpoint.path === "function" || Boolean(endpoint.mappers);

  const baseKey = () => createBaseKey(context.apiName, context.resourceName, context.endpointName);
  const key = (variables?: TVariables) =>
    createQueryKey(context.apiName, context.resourceName, context.endpointName, variables, hasVariables);
  const fn = (variables?: TVariables) => () =>
    context.fetchClient.request<TData, TVariables>({
      method: endpoint.method,
      path: endpoint.path,
      variables: variables as TVariables,
      mappers: endpoint.mappers,
    });
  const build = (variables?: TVariables) => ({
    queryKey: key(variables),
    queryFn: fn(variables),
  });

  return { baseKey, key, fn, build };
}

function buildMutationEndpoint<TData, TVariables>(
  endpoint: PendingMutationEndpoint<TData, TVariables>,
  context: EndpointContext,
) {
  const fn = (variables?: TVariables) =>
    context.fetchClient.request<TData, TVariables>({
      method: endpoint.method,
      path: endpoint.path,
      variables: variables as TVariables,
      mappers: endpoint.mappers,
    });

  return {
    fn,
    build: () => ({
      mutationFn: fn,
    }),
  };
}

export function createPendingEndpoint<TData, TVariables>(
  kind: PendingEndpoint<TData, TVariables>["kind"],
  method: PendingEndpoint<TData, TVariables>["method"],
  path: PendingEndpoint<TData, TVariables>["path"],
  mappers?: PendingEndpoint<TData, TVariables>["mappers"],
): PendingEndpoint<TData, TVariables> {
  return { kind, method, path, mappers } as PendingEndpoint<TData, TVariables>;
}
