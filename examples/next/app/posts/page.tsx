import { PageHeader, SiteShell } from "../_components/site-shell";
import { PostsInfiniteClient } from "./posts-infinite-client";

export default function PostsPage() {
  return (
    <SiteShell>
      <PageHeader
        title="Infinite posts"
        description="This page demonstrates infinite loading with the posts service, keeping the products pages focused on SEO and detail navigation."
      />
      <PostsInfiniteClient />
    </SiteShell>
  );
}
