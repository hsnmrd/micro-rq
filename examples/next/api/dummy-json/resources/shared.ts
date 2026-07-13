export type Paginated<TItem, TKey extends string> = {
  total: number;
  skip: number;
  limit: number;
} & Record<TKey, TItem[]>;

export type PaginationParams = {
  limit?: number;
  skip?: number;
  select?: string[];
  delay?: number;
};

export type SortOrder = "asc" | "desc";
