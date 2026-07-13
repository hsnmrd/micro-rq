import { apiDummy } from "../..";
import type { Cart, CartDto, CartListParams, CartListResponse, UpdateCartInput } from "./types";

export const carts = apiDummy.resource("carts", {
  list: apiDummy.get<CartListResponse, CartListParams>("/carts", {
    query: ({ limit = 8, skip = 0 }) => ({ limit, skip }),
  }),
  detail: apiDummy.get<Cart, number>((id) => `/carts/${id}`),
  byUser: apiDummy.get<CartListResponse, number>((userId) => `/carts/user/${userId}`),
  create: apiDummy.post<Cart, CartDto>("/carts/add"),
  update: apiDummy.put<Cart, UpdateCartInput>(({ id }) => `/carts/${id}`, {
    body: ({ body }) => body,
  }),
  remove: apiDummy.delete<Cart, number>((id) => `/carts/${id}`),
});

export type { Cart, CartDto, CartListParams, CartListResponse, UpdateCartInput } from "./types";
