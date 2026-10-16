import Link from "next/link";
import { BookIcon, GlobeIcon, PlusIcon } from "@/components/landing/icons";
import { ChevronRightIcon } from "./icons";
import { Panel } from "./Panel";

const actions = [
  {
    label: "Create workflow",
    description: "Compose triggers, logic, and actions on the canvas.",
    href: "/workflows",
    icon: <PlusIcon width={15} height={15} />,
  },
  {
    label: "Explore templates",
    description: "Start from proven recipes for common stacks.",
    href: "/templates",
    icon: <BookIcon width={15} height={15} />,
  },
  {
    label: "Configure integrations",
    description: "Connect the APIs, databases, and queues you already run.",
    href: "/integrations",
    icon: <GlobeIcon width={15} height={15} />,
  },
];

export function QuickActions() {
  return (
    <Panel title="Quick actions" headingId="quick-actions-heading" bodyClassName="p-3">
      <ul className="space-y-1.5">
        {actions.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="group flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 transition-colors duration-150 hover:border-line hover:bg-hover"
            >
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-ink text-muted transition-colors group-hover:border-line-strong group-hover:text-primary"
              >
                {action.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-fg">
                  {action.label}
                </span>
                <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                  {action.description}
                </span>
              </span>
              <ChevronRightIcon
                width={14}
                height={14}
                aria-hidden
                className="shrink-0 text-faint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-muted"
              />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
