// src/core/errors.ts
var MicroApiError = class extends Error {
  status;
  statusText;
  data;
  response;
  constructor(response, data) {
    super(`Request failed with ${response.status} ${response.statusText}`);
    this.name = "MicroApiError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.response = response;
  }
};
var MicroAuthRequiredError = class extends Error {
  constructor() {
    super("Authentication is required for this request.");
    this.name = "MicroAuthRequiredError";
  }
};

// src/utils/join-url.ts
function joinUrl(baseUrl, path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  if (!normalizedBase) {
    return `/${normalizedPath}`;
  }
  if (!normalizedPath) {
    return normalizedBase;
  }
  return `${normalizedBase}/${normalizedPath}`;
}

// src/utils/merge-headers.ts
function mergeHeaders(...headersList) {
  const merged = new Headers();
  for (const headers of headersList) {
    if (!headers) {
      continue;
    }
    new Headers(headers).forEach((value, key) => {
      merged.set(key, value);
    });
  }
  return merged;
}

// src/utils/parse-response.ts
async function parseResponse(response) {
  if (response.status === 204) {
    return void 0;
  }
  const text = await response.text();
  if (!text) {
    return void 0;
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.toLowerCase().includes("application/json")) {
    return JSON.parse(text);
  }
  return text;
}
async function parseErrorResponse(response) {
  const parsed = await parseResponse(response);
  return parsed === void 0 ? null : parsed;
}

// src/utils/serialize-query.ts
function serializeQuery(query) {
  if (!query) {
    return "";
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    appendQueryValue(params, key, value);
  }
  return params.toString();
}
function appendQueryValue(params, key, value) {
  if (value === void 0) {
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      appendQueryValue(params, key, item);
    }
    return;
  }
  if (value === null) {
    params.append(key, "null");
    return;
  }
  if (typeof value === "object") {
    params.append(key, JSON.stringify(value));
    return;
  }
  params.append(key, String(value));
}

// src/core/fetch-client.ts
function createFetchClient(config) {
  const fetcher = config.fetcher ?? globalThis.fetch;
  if (!fetcher) {
    throw new Error("No fetch implementation is available. Provide createMicroApi({ fetcher }).");
  }
  const request = async (input, didRefresh = false) => {
    const context = buildRequestContext(config, input);
    try {
      const response = await fetcher(...await buildFetchArgs(config, input, context));
      if (shouldUseAuth(input) && response.status === 401 && !didRefresh && config.tokenProvider?.hasRefresh()) {
        await config.tokenProvider.refreshAccessToken();
        return request(input, true);
      }
      if (!response.ok) {
        throw new MicroApiError(response, await parseErrorResponse(response));
      }
      return parseResponse(response);
    } catch (error) {
      await notifyError(config, error, context);
      throw error;
    }
  };
  return { request };
}
async function buildFetchArgs(config, input, context) {
  const query = input.mappers?.query?.(input.variables);
  const queryString = serializeQuery(query);
  const url = queryString ? `${context.url}?${queryString}` : context.url;
  context.url = url;
  const authMode = context.authMode;
  const accessToken = authMode === "none" ? null : await config.tokenProvider?.getAccessToken();
  if (authMode === "required" && !accessToken) {
    throw new MicroAuthRequiredError();
  }
  const baseHeaders = typeof config.headers === "function" ? await config.headers() : config.headers;
  const mappedHeaders = input.mappers?.headers?.(input.variables);
  const authHeaders = accessToken ? config.authHeader?.(accessToken) : void 0;
  const body = input.method === "GET" ? void 0 : input.mappers && "body" in input.mappers ? input.mappers.body?.(input.variables) : input.variables;
  const headers = mergeHeaders(baseHeaders, mappedHeaders, authHeaders);
  const init = {
    method: input.method,
    headers
  };
  if (body !== void 0) {
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    init.body = isBodyInit(body) ? body : JSON.stringify(body);
  }
  return [url, init];
}
function buildRequestContext(config, input) {
  const path = typeof input.path === "function" ? input.path(input.variables) : input.path;
  return {
    method: input.method,
    path,
    url: joinUrl(config.baseUrl, path),
    authMode: getAuthMode(input)
  };
}
async function notifyError(config, error, context) {
  try {
    await config.onError?.(error, context);
  } catch {
  }
}
function shouldUseAuth(input) {
  return getAuthMode(input) !== "none";
}
function getAuthMode(input) {
  return input.mappers?.authMode ?? "optional";
}
function isBodyInit(value) {
  return typeof value === "string" || value instanceof Blob || value instanceof FormData || value instanceof URLSearchParams || value instanceof ArrayBuffer || ArrayBuffer.isView(value) || value instanceof ReadableStream;
}

// src/core/keys.ts
function createBaseKey(apiName, resourceName, endpointName) {
  return [apiName, resourceName, endpointName];
}
function createQueryKey(apiName, resourceName, endpointName, variables, hasVariables) {
  const baseKey = createBaseKey(apiName, resourceName, endpointName);
  return hasVariables ? [...baseKey, variables] : baseKey;
}

// src/core/resource.ts
function createResource(apiName, resourceName, definition, fetchClient) {
  const resource = {};
  for (const endpointName of Object.keys(definition)) {
    const endpoint = definition[endpointName];
    const context = { apiName, resourceName, endpointName, fetchClient };
    Object.defineProperty(resource, endpointName, {
      value: endpoint.kind === "query" ? buildQueryEndpoint(endpoint, context) : buildMutationEndpoint(endpoint, context),
      enumerable: true,
      configurable: false,
      writable: false
    });
  }
  return resource;
}
function buildQueryEndpoint(endpoint, context) {
  const hasVariables = typeof endpoint.path === "function" || Boolean(endpoint.mappers);
  const baseKey = () => createBaseKey(context.apiName, context.resourceName, context.endpointName);
  const key = (variables) => createQueryKey(context.apiName, context.resourceName, context.endpointName, variables, hasVariables);
  const fn = (variables) => () => context.fetchClient.request({
    method: endpoint.method,
    path: endpoint.path,
    variables,
    mappers: endpoint.mappers
  });
  const build = (variables) => ({
    queryKey: key(variables),
    queryFn: fn(variables)
  });
  return { baseKey, key, fn, build };
}
function buildMutationEndpoint(endpoint, context) {
  const fn = (variables) => context.fetchClient.request({
    method: endpoint.method,
    path: endpoint.path,
    variables,
    mappers: endpoint.mappers
  });
  return {
    fn,
    build: () => ({
      mutationFn: fn
    })
  };
}
function createPendingEndpoint(kind, method, path, mappers) {
  return { kind, method, path, mappers };
}

// src/core/create-micro-api.ts
function createMicroApi(config) {
  const fetchClient = createFetchClient(config);
  return {
    get: createQueryFactory(),
    post: createMutationFactory("POST"),
    put: createMutationFactory("PUT"),
    patch: createMutationFactory("PATCH"),
    delete: createMutationFactory("DELETE"),
    resource: (resourceName, definition) => createResource(config.name, resourceName, definition, fetchClient)
  };
}
function createQueryFactory() {
  function get(path, mappers) {
    return createPendingEndpoint("query", "GET", path, mappers);
  }
  return get;
}
function createMutationFactory(method) {
  function mutation(path, mappers) {
    return createPendingEndpoint("mutation", method, path, mappers);
  }
  return mutation;
}

// src/core/create-token-provider.ts
function createTokenProvider(config) {
  let refreshPromise = null;
  let refreshedAccessToken = null;
  const refreshAccessToken = async () => {
    if (!config.refresh) {
      throw new Error("Token refresh is not configured.");
    }
    if (!refreshPromise) {
      refreshPromise = runRefresh(config, (tokens) => {
        refreshedAccessToken = config.getAccessTokenFromRefreshResult?.(tokens) ?? refreshedAccessToken;
      }).finally(() => {
        refreshPromise = null;
      });
    }
    return refreshPromise;
  };
  return {
    getAccessToken: async () => refreshedAccessToken ?? config.getAccessToken(),
    refreshAccessToken,
    hasRefresh: () => Boolean(config.refresh)
  };
}
async function runRefresh(config, onTokens) {
  try {
    const refreshToken = await config.getRefreshToken?.();
    const tokens = await config.refresh?.({ refreshToken });
    if (tokens === void 0) {
      throw new Error("Token refresh returned no tokens.");
    }
    onTokens(tokens);
    await config.onRefreshSuccess?.(tokens);
    return tokens;
  } catch (error) {
    try {
      await config.onRefreshFailed?.(error);
    } catch {
    }
    throw error;
  }
}
export {
  MicroApiError,
  MicroAuthRequiredError,
  createMicroApi,
  createTokenProvider
};
//# sourceMappingURL=index.js.map