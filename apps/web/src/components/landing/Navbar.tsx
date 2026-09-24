import Link from "next/link";
import { BoltIcon } from "./icons";
import { ScrollHeader } from "./ScrollHeader";
import { DesktopNav } from "./DesktopNav";
import { MobileMenu } from "./MobileMenu";

const links = [
  { label: "Features", href: "/features" },
  { label: "Documentation", href: "/docs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Security", href: "/security" },
  { label: "About", href: "/about" },
];

/**
 * Site header — a server component. Only the scroll-state wrapper and the
 * two active/mobile link islands are client; the logo and CTAs ship no JS.
 */
export function Navbar() {
  return (
    <ScrollHeader>
      <nav
        aria-label="Main"
        className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
      >
        <Link href="/" className="flex items-center gap-2.5 rounded-md">
          <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-primary text-button-text">
            <BoltIcon width={13} height={13} />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Runbolt
          </span>
        </Link>

        <DesktopNav links={links} />

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-[13.5px] text-muted transition-colors duration-200 hover:text-fg"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-primary px-3.5 py-2 text-[13.5px] font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px"
          >
            Start Building
          </Link>
        </div>

        <MobileMenu links={links} />
      </nav>
    </ScrollHeader>
  );
}
