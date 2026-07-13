import { MicroApiError, MicroAuthRequiredError } from "tanstack-rest-query";

export function describeError(error: unknown) {
  if (error instanceof MicroApiError) {
    const data = typeof error.data === "string" ? error.data : JSON.stringify(error.data);

    return `${error.status} ${error.statusText}${data ? ` - ${data}` : ""}`;
  }

  if (error instanceof MicroAuthRequiredError) {
    return "MicroAuthRequiredError: sign in before calling required endpoints.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}
