import { PageHeader, SiteShell } from "../_components/site-shell";
import { LoginClient } from "./login-client";

export default function LoginPage() {
  return (
    <SiteShell>
      <PageHeader
        title="Login"
        description="This public page calls /auth/login with authMode none and stores the returned tokens in cookies."
      />
      <section className="mx-auto max-w-md px-5 py-6">
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <LoginClient />
        </div>
      </section>
    </SiteShell>
  );
}
