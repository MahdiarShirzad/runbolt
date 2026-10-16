import type { ComponentType, SVGProps } from "react";
import {
  BoltIcon,
  CodeIcon,
  DbIcon,
  GitHubIcon,
  GoogleIcon,
  MailIcon,
  NodeGraphIcon,
  QueueIcon,
  WebhookIcon,
  WorkerIcon,
  ZapIcon,
} from "@/components/landing/icons";
import { INTEGRATION_ICON_KEYS } from "@/lib/dashboard/integrations";

const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  github: GitHubIcon,
  db: DbIcon,
  mail: MailIcon,
  zap: ZapIcon,
  google: GoogleIcon,
  nodes: NodeGraphIcon,
  bolt: BoltIcon,
  worker: WorkerIcon,
  queue: QueueIcon,
  webhook: WebhookIcon,
  code: CodeIcon,
};

/** Consistent local glyph for an integration — no external image URLs. */
export function IntegrationIcon({
  slug,
  size = 20,
}: {
  slug: string;
  size?: number;
}) {
  const key = INTEGRATION_ICON_KEYS[slug] ?? "code";
  const Glyph = ICONS[key] ?? CodeIcon;
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-ink text-muted"
    >
      <Glyph width={size} height={size} />
    </span>
  );
}
