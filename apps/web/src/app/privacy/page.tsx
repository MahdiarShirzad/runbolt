import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { legalDocs } from "@/content/legal/documents";

export const metadata: Metadata = {
  title: "Privacy Policy — Runbolt",
  description: legalDocs.privacy.description,
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1">
        <LegalArticle
          doc={legalDocs.privacy}
          siblings={[
            { label: "Terms of Service", href: "/terms" },
            { label: "Data Processing Addendum", href: "/dpa" },
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
