import { api } from "../../client/api";
import type { CreateUserDto, UpdateUserDto, User, UserListParams, UserListResponse } from "./users.types";

export const users = api.resource("users", {
  list: api.get<UserListResponse, UserListParams>(
    ({ search }) => (search ? "/users/search" : "/users"),
    {
      query: ({ page, search }) => ({
        limit: 10,
        skip: Math.max(page - 1, 0) * 10,
        q: search || undefined,
      }),
    },
  ),
  detail: api.get<User, number>((id) => `/users/${id}`),
  create: api.post<User, CreateUserDto>("/users/add", {
    body: ({ name, email }) => {
      const [firstName = name, ...rest] = name.trim().split(/\s+/);

      return {
        firstName,
        lastName: rest.join(" "),
        email,
      };
    },
  }),
  update: api.patch<User, { id: number; body: UpdateUserDto }>(
    ({ id }) => `/users/${id}`,
    {
      body: ({ body }) => body,
    },
  ),
  remove: api.delete<User, number>((id) => `/users/${id}`),
});
