export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export type CreateUserDto = {
  name: string;
  email: string;
};

export type UpdateUserDto = {
  name?: string;
  email?: string;
};

export type UserListParams = {
  page: number;
  search?: string;
};

export type UserListResponse = {
  users: User[];
  total: number;
  skip: number;
  limit: number;
};
