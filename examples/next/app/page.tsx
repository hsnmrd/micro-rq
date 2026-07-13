import Link from "next/link";
import { PageHeader, SiteShell } from "./_components/site-shell";

const examples = [
  {
    href: "/products",
    title: "Products",
    body: "SSR initial data, pagination, search, category filters, generated keys, and product detail links.",
  },
  {
    href: "/products/1",
    title: "Product detail",
    body: "SEO-friendly server rendering and metadata from a typed REST resource.",
  },
  {
    href: "/posts",
    title: "Posts",
    body: "Infinite scroll using the posts service instead of duplicating the products example.",
  },
  {
    href: "/login",
    title: "Login",
    body: "DummyJSON auth login writes tokens to cookies, then redirects to the protected account page.",
  },
  {
    href: "/account",
    title: "Protected account",
    body: "Server redirect when no token exists, plus automatic refresh through the token provider on 401.",
  },
  {
    href: "/mutations",
    title: "Mutations and upload",
    body: "POST, PUT, PATCH, DELETE, invalidation, FormData upload, and multiple clients.",
  },
  {
    href: "/errors",
    title: "Errors",
    body: "MicroApiError, MicroAuthRequiredError, and global onError behavior.",
  },
];

export default function HomePage() {
  return (
    <SiteShell>
      <PageHeader
        title="Structured Next.js example"
        description="Each page demonstrates one real workflow instead of placing every package feature into a single screen."
      />
      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-6 md:grid-cols-2 xl:grid-cols-3">
        {examples.map((example) => (
          <Link className="rounded-lg border border-neutral-200 bg-white p-5 hover:border-teal-600" href={example.href} key={example.href}>
            <h2 className="font-semibold">{example.title}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{example.body}</p>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
