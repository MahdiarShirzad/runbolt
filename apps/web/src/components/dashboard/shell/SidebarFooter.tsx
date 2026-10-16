import Link from "next/link";
import { BookIcon } from "@/components/landing/icons";
import { ArrowUpRightIcon } from "@/components/dashboard/icons";

/** Presentational sidebar footer — shared by desktop sidebar and mobile drawer. */
export function SidebarFooter() {
  return (
    <div className="mt-auto border-t border-line/70 pt-3">
      <Link
        href="/docs"
        className="group flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] text-muted transition-colors duration-150 hover:bg-hover hover:text-fg"
      >
        <span className="text-faint" aria-hidden>
          <BookIcon width={15} height={15} />
        </span>
        Documentation
        <span className="ml-auto text-faint transition-colors group-hover:text-muted" aria-hidden>
          <ArrowUpRightIcon width={13} height={13} />
        </span>
      </Link>
    </div>
  );
}
