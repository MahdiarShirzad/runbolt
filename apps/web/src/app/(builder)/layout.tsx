import type { ReactNode } from "react";

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-ink">{children}</div>;
}
