import type { Paginated, PaginationParams, SortOrder } from "../shared";

export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  sku?: string;
  thumbnail: string;
  images: string[];
  tags?: string[];
};

export type ProductCategory = {
  slug: string;
  name: string;
  url: string;
};

export type ProductListResponse = Paginated<Product, "products">;

export type ProductListParams = PaginationParams & {
  search?: string;
  category?: string;
  sortBy?: keyof Pick<Product, "title" | "price" | "rating" | "stock">;
  order?: SortOrder;
};

export type CreateProductDto = {
  title: string;
  price: number;
  category?: string;
};

export type UpdateProductDto = Partial<CreateProductDto> & {
  stock?: number;
};

export type UpdateProductInput = {
  id: number;
  body: UpdateProductDto;
  traceId?: string;
};
