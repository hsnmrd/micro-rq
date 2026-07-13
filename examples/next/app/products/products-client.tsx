"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { products, type ProductListParams } from "../../api/dummy-json/resources";

type ProductsClientProps = {
  initialParams: ProductListParams;
};

export function ProductsClient({ initialParams }: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSize = initialParams.limit ?? 12;
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const skip = Math.max(page - 1, 0) * pageSize;
  const params: ProductListParams = {
    ...initialParams,
    skip,
    search: search || undefined,
    category: search ? undefined : category || undefined,
  };
  const productsQuery = useQuery({
    ...products.list.toQuery(params),
    staleTime: 30_000,
  });
  const categoriesQuery = useQuery({
    ...products.categoryList.toQuery(),
    staleTime: 5 * 60_000,
  });
  const totalPages = Math.max(1, Math.ceil((productsQuery.data?.total ?? 0) / pageSize));

  function setFilters(next: { q?: string; category?: string; page?: number }) {
    const query = new URLSearchParams(searchParams.toString());

    if (next.q !== undefined) {
      if (next.q) {
        query.set("q", next.q);
      } else {
        query.delete("q");
      }
      query.delete("category");
    }

    if (next.category !== undefined) {
      if (next.category) {
        query.set("category", next.category);
      } else {
        query.delete("category");
      }
      query.delete("q");
    }

    query.set("page", String(next.page ?? 1));
    router.push(`/products?${query.toString()}`);
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-6">
      <div className="grid gap-3 md:grid-cols-[1fr_240px]">
        <input
          className="field"
          defaultValue={search}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setFilters({ q: event.currentTarget.value });
            }
          }}
          placeholder="Search and press Enter"
          aria-label="Search products"
        />
        <select className="field" value={category} onChange={(event) => setFilters({ category: event.target.value })}>
          <option value="">All categories</option>
          {categoriesQuery.data?.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {productsQuery.data?.products.map((product) => (
          <Link className="rounded-lg border border-neutral-200 bg-white p-3 hover:border-teal-600" href={`/products/${product.id}`} key={product.id}>
            <Image
              unoptimized
              className="aspect-square w-full rounded-md object-cover"
              src={product.thumbnail}
              alt={product.title}
              width={260}
              height={260}
            />
            <h2 className="mt-3 text-sm font-semibold">{product.title}</h2>
            <p className="mt-1 text-sm text-neutral-600">${product.price}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button className="button-secondary" disabled={page <= 1} type="button" onClick={() => setFilters({ page: page - 1 })}>
            Previous
          </button>
          <button className="button-secondary" disabled={page >= totalPages} type="button" onClick={() => setFilters({ page: page + 1 })}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
