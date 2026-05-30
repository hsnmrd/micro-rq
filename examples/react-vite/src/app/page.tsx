import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { ExampleClient } from "./example-client";
import { carts } from "../api";
import { Providers } from "./providers";

export const dynamic = "force-dynamic";

export default async function Page() {
  const queryClient = new QueryClient();

  const data = await carts.list.fn()();

  console.log(data.carts.map(item => item.id));

  await queryClient.prefetchQuery({
    ...carts.list.build(),
  });

  return (
    <Providers>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ExampleClient />
      </HydrationBoundary>
    </Providers>
  );
}
