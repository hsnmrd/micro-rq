import { apiDummy } from "../..";
import type {
  CommentListResponse,
  CreatePostDto,
  Post,
  PostListParams,
  PostListResponse,
  UpdatePostInput,
} from "./types";

export const posts = apiDummy.resource("posts", {
  list: apiDummy.get<PostListResponse, PostListParams>(
    ({ search, tag, userId }) => {
      if (search) {
        return "/posts/search";
      }

      if (tag) {
        return `/posts/tag/${tag}`;
      }

      if (userId) {
        return `/posts/user/${userId}`;
      }

      return "/posts";
    },
    {
      query: ({ limit = 10, skip = 0, select, delay, search, sortBy, order }) => ({
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
  detail: apiDummy.get<Post, number>((id) => `/posts/${id}`),
  comments: apiDummy.get<CommentListResponse, number>((postId) => `/posts/${postId}/comments`),
  tagList: apiDummy.get<string[]>("/posts/tag-list"),
  create: apiDummy.post<Post, CreatePostDto>("/posts/add"),
  update: apiDummy.patch<Post, UpdatePostInput>(({ id }) => `/posts/${id}`, {
    body: ({ body }) => body,
  }),
  remove: apiDummy.delete<Post, number>((id) => `/posts/${id}`),
});

export type {
  Comment,
  CommentListResponse,
  CreatePostDto,
  Post,
  PostListParams,
  PostListResponse,
  UpdatePostInput,
} from "./types";
