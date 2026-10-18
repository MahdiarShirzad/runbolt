import type { Metadata } from "next";
import type { ReactNode } from "react";

/** The workflow editor is a private surface — never indexed. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-ink">{children}</div>;
}
