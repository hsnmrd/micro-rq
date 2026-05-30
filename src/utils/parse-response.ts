export async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();

  if (!text) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.toLowerCase().includes("application/json")) {
    return JSON.parse(text);
  }

  return text;
}

export async function parseErrorResponse(response: Response): Promise<unknown> {
  const parsed = await parseResponse(response);
  return parsed === undefined ? null : parsed;
}
