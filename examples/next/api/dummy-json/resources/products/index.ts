import { apiDummy } from "../..";
import type {
  CreateProductDto,
  Product,
  ProductCategory,
  ProductListParams,
  ProductListResponse,
  UpdateProductInput,
} from "./types";

export const products = apiDummy.resource("products", {
  list: apiDummy.get<ProductListResponse, ProductListParams>(
    ({ search, category }) => {
      if (search) {
        return "/products/search";
      }

      if (category) {
        return `/products/category/${category}`;
      }

      return "/products";
    },
    {
      query: ({ limit = 12, skip = 0, select, delay, search, sortBy, order }) => ({
        limit,
        skip,
        select,
        delay,
        q: search || undefined,
        sortBy,
        order,
      }),
    },
  ),
  detail: apiDummy.get<Product, number>((id) => `/products/${id}`),
  categories: apiDummy.get<ProductCategory[]>("/products/categories"),
  categoryList: apiDummy.get<string[]>("/products/category-list"),
  create: apiDummy.post<Product, CreateProductDto>("/products/add"),
  update: apiDummy.put<Product, UpdateProductInput>(({ id }) => `/products/${id}`, {
    body: ({ body }) => body,
    headers: ({ traceId }) => ({
      "x-trace-id": traceId ?? crypto.randomUUID(),
    }),
  }),
  patch: apiDummy.patch<Product, UpdateProductInput>(({ id }) => `/products/${id}`, {
    body: ({ body }) => body,
  }),
  remove: apiDummy.delete<Product, number>((id) => `/products/${id}`),
});

export type {
  CreateProductDto,
  Product,
  ProductCategory,
  ProductListParams,
  ProductListResponse,
  UpdateProductDto,
  UpdateProductInput,
} from "./types";
