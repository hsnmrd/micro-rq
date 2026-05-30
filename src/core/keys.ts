export type MicroQueryKey = readonly unknown[];

export function createBaseKey(apiName: string, resourceName: string, endpointName: string): MicroQueryKey {
  return [apiName, resourceName, endpointName] as const;
}

export function createQueryKey(
  apiName: string,
  resourceName: string,
  endpointName: string,
  variables: unknown,
  hasVariables: boolean,
): MicroQueryKey {
  const baseKey = createBaseKey(apiName, resourceName, endpointName);
  return hasVariables ? [...baseKey, variables] : baseKey;
}
