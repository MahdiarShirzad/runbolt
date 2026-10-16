"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNavSections, isNavActive } from "@/lib/dashboard/nav";

/**
 * Client island owning active-link state — shared by the desktop sidebar
 * and the mobile drawer.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Application" className="flex-1 space-y-6 overflow-y-auto scroll-slim">
      {appNavSections.map((section) => (
        <div key={section.label}>
          <p className="px-2.5 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
            {section.label}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isNavActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13.5px] transition-colors duration-150 ${
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : item.soon
                          ? "text-muted/80 hover:bg-hover hover:text-fg"
                          : "text-muted hover:bg-hover hover:text-fg"
                    }`}
                  >
                    <span className={active ? "text-primary" : "text-faint"} aria-hidden>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {item.soon && (
                      <span
                        className="ml-auto rounded border border-line px-1 py-px font-mono text-[9px] uppercase tracking-wider text-faint"
                        title="Planned — not available yet"
                      >
                        Soon
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
