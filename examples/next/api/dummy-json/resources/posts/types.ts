import type { Paginated, PaginationParams, SortOrder } from "../shared";

export type Post = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
  views: number;
  userId: number;
};

export type Comment = {
  id: number;
  body: string;
  postId: number;
  likes: number;
  user: {
    id: number;
    username: string;
    fullName: string;
  };
};

export type PostListResponse = Paginated<Post, "posts">;
export type CommentListResponse = Paginated<Comment, "comments">;

export type PostListParams = PaginationParams & {
  search?: string;
  tag?: string;
  userId?: number;
  sortBy?: keyof Pick<Post, "title" | "views" | "userId">;
  order?: SortOrder;
};

export type CreatePostDto = {
  title: string;
  body: string;
  userId: number;
  tags?: string[];
};

export type UpdatePostInput = {
  id: number;
  body: Partial<CreatePostDto>;
};
