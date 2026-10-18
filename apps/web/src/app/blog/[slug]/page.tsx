import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { InlineText, renderBlock, slugifyHeading } from "@/components/docs/DocsArticle";
import { formatDate, getPost, getPostNeighbors, posts } from "@/content/blog/posts";
import type { TocItem } from "@/components/docs/DocsShell";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: `${post.title} — Blog`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const toc: TocItem[] = post.blocks
    .filter((block) => block.type === "h2")
    .map((block) => ({
      id: slugifyHeading((block as { text: string }).text),
      text: (block as { text: string }).text,
    }));

  const { prev, next } = getPostNeighbors(slug);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1">
        <article className="mx-auto max-w-6xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20">
          <div className="lg:grid lg:grid-cols-[minmax(0,720px)_240px] lg:gap-14">
            <div className="mx-auto w-full max-w-[720px]">
              <Link
                href="/blog"
                className="font-mono text-xs text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-primary"
              >
                ← Blog
              </Link>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11.5px] text-muted">
                <span className="rounded border border-line bg-raised px-1.5 py-0.5 text-fg">
                  {post.tag}
                </span>
                <span>{formatDate(post.date)}</span>
                <span className="text-line-strong" aria-hidden>
                  /
                </span>
                <span>{post.readingTime}</span>
                <span className="text-line-strong" aria-hidden>
                  /
                </span>
                <span>By {post.author}</span>
              </div>

              <h1 className="mt-5 text-balance font-display text-4xl font-bold leading-[1.1] tracking-[-0.025em] sm:text-[44px]">
                {post.title}
              </h1>

              <p className="mt-6 text-[17px] leading-[1.7] text-muted sm:text-[18px]">
                <InlineText
                  text={post.blocks[0]?.type === "p" ? post.blocks[0].text : post.excerpt}
                />
              </p>

              <div className="mt-8 space-y-6 [&>h2:first-of-type]:border-t-0 [&>h2:first-of-type]:pt-0">
                {post.blocks.slice(1).map((block, i) => renderBlock(block, i))}
              </div>

              {/* On this page — bottom panel on small screens, right rail on lg+ */}
              {toc.length > 0 && (
                <nav
                  aria-label="On this page"
                  className="mt-12 rounded-lg border border-line/70 bg-surface/50 p-4 lg:hidden"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                    On this page
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
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

              {/* Prev / next */}
              {(prev || next) && (
                <nav
                  aria-label="More posts"
                  className="mt-14 grid gap-3 border-t border-line/60 pt-8 sm:grid-cols-2"
                >
                  {prev ? (
                    <Link
                      href={`/blog/${prev.slug}`}
                      className="group rounded-lg border border-line bg-surface/50 p-4 transition-colors hover:border-line-strong hover:bg-surface"
                    >
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                        ← Newer
                      </p>
                      <p className="mt-1.5 text-sm font-medium text-fg transition-colors group-hover:text-primary">
                        {prev.title}
                      </p>
                    </Link>
                  ) : (
                    <span aria-hidden />
                  )}
                  {next && (
                    <Link
                      href={`/blog/${next.slug}`}
                      className="group rounded-lg border border-line bg-surface/50 p-4 text-right transition-colors hover:border-line-strong hover:bg-surface"
                    >
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">
                        Older →
                      </p>
                      <p className="mt-1.5 text-sm font-medium text-fg transition-colors group-hover:text-primary">
                        {next.title}
                      </p>
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {/* Sticky table of contents (lg+) */}
            {toc.length > 0 && (
              <aside className="hidden lg:block">
                <nav
                  aria-label="On this page"
                  className="sticky top-24 border-l border-line/70 pl-4"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                    On this page
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="text-sm leading-snug text-muted transition-colors hover:text-fg"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
