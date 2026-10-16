"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Horizontal scroll container with edge peeks that only appear while the
 * content is actually scrollable in that direction — an honest affordance
 * instead of a permanent (misleading) fade.
 */
export function ScrollArea({
  children,
  className = "",
  fadeFrom = "surface",
  label,
}: {
  children: ReactNode;
  className?: string;
  /** background token the edge gradient should blend into */
  fadeFrom?: "surface" | "code";
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const scrollable = el.scrollWidth > el.clientWidth + 2;
      setEdges({
        left: scrollable && el.scrollLeft > 2,
        right: scrollable && el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const fade =
    fadeFrom === "code" ? "from-code" : "from-surface";

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={() => {
          const el = ref.current;
          if (!el) return;
          setEdges({
            left: el.scrollWidth > el.clientWidth + 2 && el.scrollLeft > 2,
            right:
              el.scrollWidth > el.clientWidth + 2 &&
              el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
          });
        }}
        className={`scroll-slim overflow-x-auto ${className}`}
        role={label ? "region" : undefined}
        aria-label={label}
        tabIndex={label ? 0 : undefined}
      >
        {children}
      </div>
      {edges.left && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r ${fade} to-transparent`}
        />
      )}
      {edges.right && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l ${fade} to-transparent`}
        />
      )}
    </div>
  );
}
