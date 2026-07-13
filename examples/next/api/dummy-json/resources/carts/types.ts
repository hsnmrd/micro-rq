import type { Paginated } from "../shared";

export type CartProduct = {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedTotal: number;
  thumbnail: string;
};

export type Cart = {
  id: number;
  products: CartProduct[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
};

export type CartListResponse = Paginated<Cart, "carts">;

export type CartListParams = {
  limit?: number;
  skip?: number;
};

export type CartDto = {
  userId: number;
  products: Array<{
    id: number;
    quantity: number;
  }>;
};

export type UpdateCartInput = {
  id: number;
  body: CartDto;
};
