export type Cart = {
  id: number;
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
};

export type CartListResponse = {
  carts: Cart[];
  total: number;
  skip: number;
  limit: number;
};
