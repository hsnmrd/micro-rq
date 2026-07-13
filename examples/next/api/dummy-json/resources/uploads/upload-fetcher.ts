import { setUploadProgress } from "./progress";

export function createUploadFetcher(progressId: string): typeof fetch {
  return async (input, init) => {
    if (typeof XMLHttpRequest === "undefined") {
      return fetch(input, init);
    }

    return new Promise<Response>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      xhr.open(init?.method ?? "GET", url);

      new Headers(init?.headers).forEach((value, key) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(progressId, Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploadProgress(progressId, 100);
        resolve(
          new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: {
              "content-type": xhr.getResponseHeader("content-type") ?? "text/plain",
            },
          }),
        );
      };

      xhr.onerror = () => reject(new TypeError("Upload failed"));
      xhr.send(init?.body instanceof ReadableStream ? null : (init?.body as XMLHttpRequestBodyInit | null) ?? null);
    });
  };
}
