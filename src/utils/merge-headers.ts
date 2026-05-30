export function mergeHeaders(...headersList: Array<HeadersInit | undefined>): Headers {
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
