import { MicroApiError, MicroAuthRequiredError } from "./errors";
import type { CreateMicroApiConfig, MicroRequestContext, RequestInput } from "./types";
import { joinUrl } from "../utils/join-url";
import { mergeHeaders } from "../utils/merge-headers";
import { parseErrorResponse, parseResponse } from "../utils/parse-response";
import { serializeQuery } from "../utils/serialize-query";

export type FetchClient = {
  request: <TData, TVariables>(input: RequestInput<TVariables>) => Promise<TData>;
};

export function createFetchClient(config: CreateMicroApiConfig): FetchClient {
  const fetcher = config.fetcher ?? globalThis.fetch;

  if (!fetcher) {
    throw new Error("No fetch implementation is available. Provide createMicroApi({ fetcher }).");
  }

  const request = async <TData, TVariables>(
    input: RequestInput<TVariables>,
    didRefresh = false,
  ): Promise<TData> => {
    const context = buildRequestContext(config, input);

    try {
      const response = await fetcher(...(await buildFetchArgs(config, input, context)));

      if (shouldUseAuth(input) && response.status === 401 && !didRefresh && config.tokenProvider?.hasRefresh()) {
        await config.tokenProvider.refreshAccessToken();
        return request<TData, TVariables>(input, true);
      }

      if (!response.ok) {
        throw new MicroApiError(response, await parseErrorResponse(response));
      }

      return parseResponse(response) as Promise<TData>;
    } catch (error) {
      await notifyError(config, error, context);
      throw error;
    }
  };

  return { request };
}

async function buildFetchArgs<TVariables>(
  config: CreateMicroApiConfig,
  input: RequestInput<TVariables>,
  context: MicroRequestContext,
): Promise<[RequestInfo | URL, RequestInit]> {
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
  const authHeaders = accessToken ? config.authHeader?.(accessToken) : undefined;
  const body =
    input.method === "GET"
      ? undefined
      : input.mappers && "body" in input.mappers
        ? input.mappers.body?.(input.variables)
        : input.variables;
  const bodyType = input.mappers?.bodyType ?? "json";
  const headers = mergeHeaders(baseHeaders, mappedHeaders, authHeaders);
  const init: RequestInit = {
    method: input.method,
    headers,
  };

  if (body !== undefined) {
    if (bodyType === "form-data") {
      init.body = toFormData(body);
      return [url, init];
    }

    const isRawBody = isBodyInit(body);

    if (!isRawBody && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    init.body = isRawBody ? body : JSON.stringify(body);
  }

  return [url, init];
}

function buildRequestContext<TVariables>(
  config: CreateMicroApiConfig,
  input: RequestInput<TVariables>,
): MicroRequestContext {
  const path = typeof input.path === "function" ? input.path(input.variables) : input.path;

  return {
    method: input.method,
    path,
    url: joinUrl(config.baseUrl, path),
    authMode: getAuthMode(input),
  };
}

async function notifyError(
  config: CreateMicroApiConfig,
  error: unknown,
  context: MicroRequestContext,
): Promise<void> {
  try {
    await config.onError?.(error, context);
  } catch {
    // Preserve the original request error.
  }
}

function shouldUseAuth<TVariables>(input: RequestInput<TVariables>): boolean {
  return getAuthMode(input) !== "none";
}

function getAuthMode<TVariables>(input: RequestInput<TVariables>) {
  return input.mappers?.authMode ?? "optional";
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === "string" ||
    isInstanceOfAvailableGlobal(value, "Blob") ||
    isInstanceOfAvailableGlobal(value, "FormData") ||
    isInstanceOfAvailableGlobal(value, "URLSearchParams") ||
    isInstanceOfAvailableGlobal(value, "ArrayBuffer") ||
    ArrayBuffer.isView(value) ||
    isInstanceOfAvailableGlobal(value, "ReadableStream")
  );
}

function isInstanceOfAvailableGlobal<TName extends keyof typeof globalThis>(
  value: unknown,
  name: TName,
): boolean {
  const constructor = globalThis[name];
  return typeof constructor === "function" && value instanceof constructor;
}

function toFormData(body: unknown): FormData {
  if (isInstanceOfAvailableGlobal(body, "FormData")) {
    return body as FormData;
  }

  if (!isPlainObject(body)) {
    throw new Error('FormData bodyType requires a plain object or FormData instance.');
  }

  const formData = new FormData();

  for (const [key, value] of Object.entries(body)) {
    appendFormDataValue(formData, key, value);
  }

  return formData;
}

function appendFormDataValue(formData: FormData, key: string, value: unknown): void {
  if (value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendFormDataValue(formData, key, item);
    }
    return;
  }

  if (value === null) {
    formData.append(key, "null");
    return;
  }

  if (isInstanceOfAvailableGlobal(value, "Blob")) {
    formData.append(key, value as Blob);
    return;
  }

  if (value instanceof Date) {
    formData.append(key, value.toISOString());
    return;
  }

  if (typeof value === "object") {
    formData.append(key, JSON.stringify(value));
    return;
  }

  formData.append(key, String(value));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !isBodyInit(value);
}
