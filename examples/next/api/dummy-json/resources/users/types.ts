import type { Paginated, PaginationParams, SortOrder } from "../shared";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  maidenName?: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  image: string;
  role?: string;
  company?: {
    department: string;
    name: string;
    title: string;
  };
};

export type UserListResponse = Paginated<User, "users">;

export type UserListParams = PaginationParams & {
  search?: string;
  key?: "hair.color" | "address.city" | "company.department";
  value?: string;
  sortBy?: keyof Pick<User, "firstName" | "lastName" | "age" | "email">;
  order?: SortOrder;
};

export type CreateUserDto = {
  firstName: string;
  lastName: string;
  age: number;
};

export type UpdateUserInput = {
  id: number;
  body: Partial<CreateUserDto>;
};
