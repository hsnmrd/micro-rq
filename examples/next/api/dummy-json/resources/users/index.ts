import { apiDummy } from "../..";
import type { CreateUserDto, UpdateUserInput, User, UserListParams, UserListResponse } from "./types";

export const users = apiDummy.resource("users", {
  list: apiDummy.get<UserListResponse, UserListParams>(
    ({ search, key, value }) => {
      if (search) {
        return "/users/search";
      }

      if (key && value) {
        return "/users/filter";
      }

      return "/users";
    },
    {
      query: ({ limit = 10, skip = 0, select, delay, search, key, value, sortBy, order }) => ({
        limit,
        skip,
        select,
        delay,
        q: search || undefined,
        key,
        value,
        sortBy,
        order,
      }),
    },
  ),
  detail: apiDummy.get<User, number>((id) => `/users/${id}`),
  posts: apiDummy.get<unknown, number>((id) => `/users/${id}/posts`),
  carts: apiDummy.get<unknown, number>((id) => `/users/${id}/carts`),
  todos: apiDummy.get<unknown, number>((id) => `/users/${id}/todos`),
  create: apiDummy.post<User, CreateUserDto>("/users/add"),
  update: apiDummy.put<User, UpdateUserInput>(({ id }) => `/users/${id}`, {
    body: ({ body }) => body,
  }),
  remove: apiDummy.delete<User, number>((id) => `/users/${id}`),
});

export type { CreateUserDto, UpdateUserInput, User, UserListParams, UserListResponse } from "./types";
