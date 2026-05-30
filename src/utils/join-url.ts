export function joinUrl(baseUrl: string, path: string): string {
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
