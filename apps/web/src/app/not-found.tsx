import { pageMetadata } from "@/lib/seo";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { NotFoundHero } from "@/components/not-found/NotFoundHero";
import { DebugPanel } from "@/components/not-found/DebugPanel";

/** The title template renders this as "Not Found — Runbolt". */
export const metadata = pageMetadata({
  title: "Not Found",
  description: "The page you're looking for may have been moved, deleted, or never existed.",
});

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col justify-center">
        <NotFoundHero />
        <div className="pb-20 sm:pb-28">
          <DebugPanel />
        </div>
      </main>
      <Footer />
    </div>
  );
}
