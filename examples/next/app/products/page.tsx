import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { products, type ProductListParams } from "../../api/dummy-json/resources";
import { PageHeader, SiteShell } from "../_components/site-shell";
import { ProductsClient } from "./products-client";

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const query = await searchParams;
  const page = Number(query.page ?? "1");
  const pageSize = 12;
  const initialParams: ProductListParams = {
    limit: pageSize,
    skip: Math.max(page - 1, 0) * pageSize,
    search: query.q || undefined,
    category: query.q ? undefined : query.category || undefined,
    sortBy: "price",
    order: "asc",
    select: ["title", "price", "rating", "stock", "thumbnail", "category"],
  };
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(products.list.toQuery(initialParams)),
    queryClient.prefetchQuery(products.categoryList.toQuery()),
  ]);

  return (
    <SiteShell>
      <PageHeader
        title="Products"
        description="The first product page is prefetched on the server and hydrated into the TanStack Query cache."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsClient initialParams={initialParams} />
      </HydrationBoundary>
    </SiteShell>
  );
}
