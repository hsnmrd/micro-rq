import { PageHeader, SiteShell } from "../_components/site-shell";
import { ErrorsClient } from "./errors-client";

export default function ErrorsPage() {
  return (
    <SiteShell>
      <PageHeader
        title="Errors"
        description="Failed HTTP responses throw MicroApiError. Missing required tokens throw MicroAuthRequiredError before fetch runs."
      />
      <ErrorsClient />
    </SiteShell>
  );
}
