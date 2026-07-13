import { apiDummy } from "../..";

export type MockHttpResponse = {
  status: string;
  message: string;
};

export type MockHttpInput = {
  status: number;
  message?: string;
};

export const mockHttp = apiDummy.resource("http", {
  status: apiDummy.get<MockHttpResponse, MockHttpInput>(
    ({ status, message }) => `/http/${status}${message ? `/${message}` : ""}`,
  ),
});
