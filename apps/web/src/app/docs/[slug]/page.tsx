import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { docPages } from "@/content/docs/content";
import { docMetas, getNeighbors } from "@/content/docs/registry";
import { Breadcrumbs } from "@/components/docs/Breadcrumbs";
import { DocsShell, type TocItem } from "@/components/docs/DocsShell";
import { InlineText, renderBlock, slugifyHeading } from "@/components/docs/DocsArticle";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return docMetas
    .filter((meta) => meta.slug !== "")
    .map((meta) => ({ slug: meta.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = docPages[slug];
  if (!doc) return {};
  return {
    title: `${doc.meta.title} — Runbolt Docs`,
    description: doc.meta.description,
  };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = docPages[slug];
  if (!doc) notFound();

  const toc: TocItem[] = doc.blocks
    .filter((block) => block.type === "h2")
    .map((block) => ({ id: slugifyHeading(block.text), text: block.text }));

  const { prev, next } = getNeighbors(doc.meta.slug);

  return (
    <DocsShell
      toc={toc}
      prev={prev ? { title: prev.title, href: prev.path } : undefined}
      next={next ? { title: next.title, href: next.path } : undefined}
    >
      <div className="mx-auto max-w-[720px]">
        <Breadcrumbs
          trail={[
            { label: "Docs", href: "/docs" },
            { label: doc.meta.section },
            { label: doc.meta.title },
          ]}
        />
        <h1 className="mt-5 text-balance text-4xl font-bold tracking-[-0.02em]">
          {doc.meta.title}
        </h1>
        <p className="mt-4 text-[16.5px] leading-relaxed text-muted">
          <InlineText text={doc.blocks[0]?.type === "p" ? doc.blocks[0].text : doc.meta.description} />
        </p>
        <div className="mt-8 space-y-6 [&>h2:first-of-type]:border-t-0 [&>h2:first-of-type]:pt-0">
          {doc.blocks.slice(1).map((block, i) => renderBlock(block, i))}
        </div>
      </div>
    </DocsShell>
  );
}
