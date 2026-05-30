import { api } from "../../client/api";
import type { Cart, CartListResponse } from "./carts.types";

export const carts = api.resource("carts", {
  list: api.get<CartListResponse>("/carts?limit=2", {
    authMode: "none",
  }),
  detail: api.get<Cart, number>((id) => `/carts/${id}`, {
    authMode: "none",
  }),
});
