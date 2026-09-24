import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { legalDocs } from "@/content/legal/documents";

export const metadata: Metadata = {
  title: "Data Processing Addendum — Runbolt",
  description: legalDocs.dpa.description,
};

export default function DpaPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1">
        <LegalArticle
          doc={legalDocs.dpa}
          siblings={[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
