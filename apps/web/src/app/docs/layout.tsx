import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { DocsSearch } from "@/components/docs/DocsSearch";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <DocsSearch />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
