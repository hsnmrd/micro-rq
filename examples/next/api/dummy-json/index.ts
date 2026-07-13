import { createMicroApi, MicroApiError } from "tanstack-rest-query";
import { tokenProvider } from "./token-provider";

const baseUrl = "https://dummyjson.com";

export const publicApiDummy = createMicroApi({
  baseUrl,
  name: "dummy-json-public",
  tokenProvider,
  authHeader: (token) => ({
    Authorization: `Bearer ${token}`,
  }),
  onError(error) {
    if (error instanceof MicroApiError && error.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },
  headers: () => ({
    "x-example-client": "micro-rq-next",
  }),
});

export const apiDummy = publicApiDummy.extend({
  name: "dummy-json",
});

export const httpApiDummy = publicApiDummy.extend({
  name: "dummy-json-http",
});
