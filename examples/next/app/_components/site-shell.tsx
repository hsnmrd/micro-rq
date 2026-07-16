import Link from "next/link";

const links = [
  { href: "/", label: "Overview" },
  { href: "/products", label: "Products" },
  { href: "/posts", label: "Posts" },
  { href: "/account", label: "Account" },
  { href: "/mutations", label: "Mutations" },
  { href: "/errors", label: "Errors" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <Link className="text-lg font-bold" href="/">
            micro-rq DummyJSON
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map((link) => (
              <Link className="rounded-md px-3 py-2 text-neutral-700 hover:bg-neutral-100" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <h1 className="text-3xl font-bold tracking-normal">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{description}</p>
      </div>
    </div>
  );
}
