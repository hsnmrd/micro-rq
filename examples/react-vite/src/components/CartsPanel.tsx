"use client";

import { useQuery } from "@tanstack/react-query";
import { carts } from "../api";

export function CartsPanel() {
  const cartsQuery = useQuery({
    ...carts.list.build(),
    staleTime: 30_000,
  });

  if (cartsQuery.isLoading) {
    return <p>Loading carts</p>;
  }

  if (cartsQuery.isError) {
    return <p>Could not load carts.</p>;
  }

  if (!cartsQuery.data) {
    return null;
  }

  return (
    <div className="stack">
      <p className="muted">
        This query is prefetched in the Server Component with QueryClient.prefetchQuery and hydrated on the client.
      </p>
      {cartsQuery.data.carts.slice(0, 4).map((cart) => (
        <div className="summary-row" key={cart.id}>
          <strong>Cart #{cart.id}</strong>
          <span className="muted">
            {cart.totalProducts} products, ${cart.discountedTotal}
          </span>
        </div>
      ))}
    </div>
  );
}
