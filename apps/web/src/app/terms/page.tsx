import { pageMetadata } from "@/lib/seo";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { legalDocs } from "@/content/legal/documents";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: legalDocs.terms.description,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1">
        <LegalArticle
          doc={legalDocs.terms}
          siblings={[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Data Processing Addendum", href: "/dpa" },
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
