"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { products } from "../../../api/dummy-json/resources";

export function ProductDetailClient({ productId }: { productId: number }) {
  const productQuery = useQuery({
    ...products.detail.toQuery(productId),
    staleTime: 60_000,
  });
  const product = productQuery.data;

  if (!product) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 text-sm text-neutral-600">Loading product</div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <Image
        unoptimized
        className="aspect-square w-full rounded-lg border border-neutral-200 bg-white object-cover"
        src={product.thumbnail}
        alt={product.title}
        width={640}
        height={640}
      />
      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Detail label="Price" value={`$${product.price}`} />
          <Detail label="Rating" value={String(product.rating)} />
          <Detail label="Stock" value={String(product.stock)} />
          <Detail label="Category" value={product.category} />
          <Detail label="Brand" value={product.brand ?? "No brand"} />
          <Detail label="SKU" value={product.sku ?? "No SKU"} />
        </dl>
        <pre className="mt-5 overflow-auto rounded-md bg-neutral-950 p-3 text-xs text-neutral-100">
          {JSON.stringify(
            {
              exactKey: products.detail.key(product.id),
              listBaseKey: products.list.baseKey(),
            },
            null,
            2,
          )}
        </pre>
        <Link className="button-secondary mt-5 inline-flex" href="/products">
          Back to products
        </Link>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-neutral-100 p-3">
      <dt className="text-xs uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
