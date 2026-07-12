import { notFound } from "next/navigation";
import { DocsShell } from "../../components/docs-shell";
import { getPage, pages } from "../../lib/docs-content";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return pages
    .filter((page) => page.slug !== "getting-started")
    .map((page) => ({
      slug: page.slug,
    }));
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const page = getPage(slug);

  if (!page) {
    notFound();
  }

  return <DocsShell page={page} />;
}
