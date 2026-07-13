import { PageHeader, SiteShell } from "../_components/site-shell";
import { MutationsClient } from "./mutations-client";

export default function MutationsPage() {
  return (
    <SiteShell>
      <PageHeader
        title="Mutations, uploads, and multiple clients"
        description="This page keeps write examples separate from SEO product browsing: POST, PUT, PATCH, DELETE, FormData upload, invalidation, and useQueries."
      />
      <MutationsClient />
    </SiteShell>
  );
}
