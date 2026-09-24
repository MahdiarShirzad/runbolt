import type { ReactNode } from "react";
import { Reveal } from "../landing/Reveal";
import { SectionHeader } from "../ui/kit";
import {
  ClockIcon,
  DbIcon,
  FilterIcon,
  GlobeIcon,
  QueueIcon,
  ShuffleIcon,
  WebhookIcon,
  WorkerIcon,
  ZapIcon,
} from "../landing/icons";
import { kindColor } from "./shared";

type NodeEntry = {
  name: string;
  description: string;
  icon: ReactNode;
  kind: keyof typeof kindColor;
};

const nodes: NodeEntry[] = [
  { name: "Trigger", description: "Start workflows from schedules, events, or code.", icon: <ZapIcon width={16} height={16} />, kind: "trigger" },
  { name: "HTTP", description: "Call any REST or GraphQL endpoint with retries built in.", icon: <GlobeIcon width={16} height={16} />, kind: "http" },
  { name: "Webhook", description: "Receive events from external services in real time.", icon: <WebhookIcon width={16} height={16} />, kind: "webhook" },
  { name: "Condition", description: "Branch execution paths based on expressions.", icon: <FilterIcon width={16} height={16} />, kind: "condition" },
  { name: "Transform", description: "Map, filter, and reshape data between steps.", icon: <ShuffleIcon width={16} height={16} />, kind: "transform" },
  { name: "Database", description: "Query and write to PostgreSQL, MySQL, and more.", icon: <DbIcon width={16} height={16} />, kind: "db" },
  { name: "Worker", description: "Offload long-running jobs to managed queues.", icon: <WorkerIcon width={16} height={16} />, kind: "worker" },
  { name: "Queue", description: "Buffer and batch work with backpressure control.", icon: <QueueIcon width={16} height={16} />, kind: "queue" },
  { name: "Delay", description: "Pause runs for seconds, hours, or until a date.", icon: <ClockIcon width={16} height={16} />, kind: "delay" },
];

export function NodeEcosystem() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="nodes-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            id="nodes-heading"
            eyebrow="Node ecosystem"
            title="Composable building blocks."
            lede="Every workflow is a graph of focused nodes. Start with the essentials and extend with your own."
          />
        </Reveal>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node, i) => (
            <Reveal key={node.name} delay={(i % 3) * 60}>
              <article className="group flex h-full items-start gap-3.5 rounded-lg border border-line bg-surface/50 p-4 transition-colors duration-200 hover:border-line-strong hover:bg-surface">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-raised ${kindColor[node.kind]} transition-colors duration-200 group-hover:border-line-strong`}
                >
                  {node.icon}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-fg">
                    {node.name}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">
                    {node.description}
                  </span>
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
