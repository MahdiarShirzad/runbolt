"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Client island owning only the scrolled state of the site header.
 * Everything rendered inside it (logo, links, CTAs) is passed as
 * server-rendered children.
 */
export function ScrollHeader({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-line/80 bg-ink/85 backdrop-blur-md"
          : "border-transparent bg-ink/50 backdrop-blur-sm"
      }`}
    >
      {children}
    </header>
  );
}
