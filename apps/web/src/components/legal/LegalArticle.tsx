import Link from "next/link";
import { InlineText, renderBlock, slugifyHeading } from "@/components/docs/DocsArticle";
import { Eyebrow } from "@/components/ui/kit";
import type { LegalDoc } from "@/content/legal/documents";

/**
 * Shared layout for legal documents — trace-chrome header (mono breadcrumb,
 * updated date, contact) over an article body rendered with the same block
 * renderer the docs use, so typography matches across the site.
 */
export function LegalArticle({
  doc,
  siblings,
}: {
  doc: LegalDoc;
  siblings?: { label: string; href: string }[];
}) {
  const toc: { id: string; text: string }[] = doc.blocks
    .filter((block) => block.type === "h2")
    .map((block) => ({
      id: slugifyHeading((block as { text: string }).text),
      text: (block as { text: string }).text,
    }));

  return (
    <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
      <div className="mx-auto max-w-[720px]">
        <p className="font-mono text-[11px] text-muted">
          <span className="text-faint">runbolt</span>
          <span className="text-line-strong"> / </span>
          <span className="text-faint">legal</span>
          <span className="text-line-strong"> / </span>
          <span className="text-primary">{doc.slug}</span>
        </p>

        <h1 className="mt-5 text-balance font-display text-4xl font-bold tracking-[-0.025em] sm:text-5xl">
          {doc.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11.5px] text-faint">
          <span>last updated {doc.updated}</span>
          <span className="text-line-strong" aria-hidden>
            /
          </span>
          <Link
            href="/contact"
            className="underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-primary"
          >
            questions → contact
          </Link>
        </div>

        <p className="mt-6 text-[16.5px] leading-relaxed text-muted">
          <InlineText text={doc.blocks[0]?.type === "p" ? doc.blocks[0].text : doc.description} />
        </p>

        <div className="mt-8 space-y-6 [&>h2:first-of-type]:border-t-0 [&>h2:first-of-type]:pt-0">
          {doc.blocks.slice(1).map((block, i) => renderBlock(block, i))}
        </div>

        {/* On this page + sibling documents */}
        <div className="mt-14 grid gap-8 border-t border-line/70 pt-8 sm:grid-cols-2">
          {toc.length > 0 && (
            <nav aria-label="On this page">
              <Eyebrow>On this page</Eyebrow>
              <ul className="mt-4 space-y-2">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-sm text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-primary"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {siblings && siblings.length > 0 && (
            <nav aria-label="Other legal documents">
              <Eyebrow>Other documents</Eyebrow>
              <ul className="mt-4 space-y-2">
                {siblings.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className="text-sm text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-primary"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
