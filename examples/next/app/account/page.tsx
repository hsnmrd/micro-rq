import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { accessTokenKey } from "../../api/dummy-json/token-provider";
import { PageHeader, SiteShell } from "../_components/site-shell";
import { AccountClient } from "./account-client";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(accessTokenKey)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  return (
    <SiteShell>
      <PageHeader
        title="Protected account"
        description="The server redirects to login when the auth cookie is missing. The client query then loads /auth/me and automatic refresh happens on 401."
      />
      <section className="mx-auto max-w-3xl px-5 py-6">
        <AccountClient />
      </section>
    </SiteShell>
  );
}
