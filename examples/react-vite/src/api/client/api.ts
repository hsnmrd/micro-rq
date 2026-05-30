import { createMicroApi, MicroApiError } from "micro-rq";
import { authProvider } from "./token-provider";

export const api = createMicroApi({
  name: "dummyjson",
  baseUrl: "https://dummyjson.com",
  tokenProvider: authProvider,
  authHeader: (token) => ({
    Authorization: `Bearer ${token}`,
  }),
  onError: (error) => {
    if (error instanceof MicroApiError && error.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },
});
