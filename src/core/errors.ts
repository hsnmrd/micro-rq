export class MicroApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data: unknown;
  readonly response: Response;

  constructor(response: Response, data: unknown) {
    super(`Request failed with ${response.status} ${response.statusText}`);
    this.name = "MicroApiError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.response = response;
  }
}

export class MicroAuthRequiredError extends Error {
  constructor() {
    super("Authentication is required for this request.");
    this.name = "MicroAuthRequiredError";
  }
}
