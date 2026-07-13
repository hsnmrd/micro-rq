import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, type Product } from "../../../api/dummy-json/resources";
import { PageHeader, SiteShell } from "../../_components/site-shell";
import { ProductDetailClient } from "./product-detail-client";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await products.detail.fn(Number(id))();

  return {
    title: `${product.title} | DummyJSON Product`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const productId = Number(id);
  const queryClient = new QueryClient();
  const detailQuery = products.detail.toQuery(productId);

  await queryClient.prefetchQuery(detailQuery);

  const product = queryClient.getQueryData<Product>(detailQuery.queryKey);

  if (!product) {
    notFound();
  }

  return (
    <SiteShell>
      <PageHeader title={product.title} description={product.description} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductDetailClient productId={productId} />
      </HydrationBoundary>
    </SiteShell>
  );
}
