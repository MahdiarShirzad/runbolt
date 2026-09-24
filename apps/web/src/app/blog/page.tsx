import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Reveal } from "@/components/landing/Reveal";
import { Eyebrow } from "@/components/ui/kit";
import { ArrowRightIcon } from "@/components/landing/icons";
import { formatDate, posts } from "@/content/blog/posts";

export const metadata: Metadata = {
  title: "Blog — Runbolt",
  description:
    "Notes from building Runbolt: execution engines, versioning, idempotency, and product decisions explained.",
};

export default function BlogPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-14 sm:pt-20">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="bg-grid mask-fade-radial absolute inset-0 opacity-50" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-24">
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                <span className="relative mr-2.5 inline-flex h-[7px] w-[7px] items-center justify-center align-middle" aria-hidden>
                  <span className="absolute inset-0 border border-volt/60" />
                  <span className="h-[3px] w-[3px] bg-volt" />
                </span>
                Runbolt blog
              </p>
              <h1 className="mt-6 text-balance font-display text-4xl font-bold leading-[1.06] tracking-[-0.025em] sm:text-5xl lg:text-[64px]">
                Notes from building the execution layer
                <span className="text-primary">.</span>
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
                How Runbolt works under the hood — versioning, retries,
                observability — and the product decisions behind them, written
                by the people making them.
              </p>
            </div>

            <Reveal className="mt-14 sm:mt-16">
              <ol>
                {posts.map((post) => (
                  <li key={post.slug} className="border-t border-line/70">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group grid gap-2 py-7 transition-colors sm:grid-cols-[130px_1fr_auto] sm:gap-8 sm:py-8"
                    >
                      <div className="font-mono text-xs leading-6 text-faint">
                        <p>{formatDate(post.date)}</p>
                        <p className="text-muted/70">{post.readingTime}</p>
                      </div>
                      <div className="max-w-2xl">
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted/70">
                          {post.tag}
                        </p>
                        <h2 className="mt-1.5 font-display text-xl font-semibold tracking-tight text-fg transition-colors duration-200 group-hover:text-primary sm:text-2xl">
                          {post.title}
                        </h2>
                        <p className="mt-2 text-[15px] leading-relaxed text-muted">
                          {post.excerpt}
                        </p>
                      </div>
                      <span
                        className="hidden self-center text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary sm:block"
                        aria-hidden
                      >
                        <ArrowRightIcon width={16} height={16} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
              <div className="border-t border-line/70" aria-hidden />
            </Reveal>

            <Reveal delay={120} className="mt-10">
              <p className="flex items-center gap-2.5 font-mono text-xs text-faint">
                <Eyebrow>More soon</Eyebrow>
                <span>
                  New posts land with major platform changes — the{" "}
                  <Link
                    href="/docs/getting-started"
                    className="text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-primary"
                  >
                    changelog
                  </Link>{" "}
                  tracks the rest.
                </span>
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
