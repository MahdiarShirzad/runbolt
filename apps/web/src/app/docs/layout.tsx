import { DocsNavbar } from "@/components/docs/DocsNavbar";
import { DocsSearch } from "@/components/docs/DocsSearch";
import { DocsFooter } from "@/components/docs/DocsFooter";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DocsNavbar />
      <DocsSearch />
      <div className="flex-1">{children}</div>
      <DocsFooter />
    </div>
  );
}
