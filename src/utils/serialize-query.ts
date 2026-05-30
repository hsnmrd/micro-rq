export function serializeQuery(query?: Record<string, unknown>): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    appendQueryValue(params, key, value);
  }

  return params.toString();
}

function appendQueryValue(params: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined) {
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
