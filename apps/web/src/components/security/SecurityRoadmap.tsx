import { Reveal } from "../landing/Reveal";

type RoadmapStatus = "available" | "development" | "planned";

const statusMeta: Record<RoadmapStatus, { label: string; dot: string; pill: string }> = {
  available: {
    label: "Available",
    dot: "bg-ok",
    pill: "border-ok/30 bg-ok/10 text-ok",
  },
  development: {
    label: "In Development",
    dot: "bg-primary",
    pill: "border-primary/30 bg-primary/10 text-primary",
  },
  planned: {
    label: "Planned",
    dot: "bg-muted",
    pill: "border-line bg-raised text-muted",
  },
};

type RoadmapItem = { name: string; text: string; status: RoadmapStatus };

const columns: { status: RoadmapStatus; items: RoadmapItem[] }[] = [
  {
    status: "available",
    items: [
      {
        name: "Execution Visibility",
        text: "Logs, states, retries, and outputs recorded for every run.",
        status: "available",
      },
    ],
  },
  {
    status: "development",
    items: [
      {
        name: "Authentication",
        text: "Account sign-in with verified sessions for the platform.",
        status: "development",
      },
      {
        name: "Access Control",
        text: "Roles that shape who can create, edit, execute, or inspect workflows.",
        status: "development",
      },
    ],
  },
  {
    status: "planned",
    items: [
      {
        name: "Secrets Management",
        text: "Dedicated storage for credentials, separate from workflow logic.",
        status: "planned",
      },
      {
        name: "Audit Visibility",
        text: "An activity trail for workflow and configuration changes.",
        status: "planned",
      },
      {
        name: "Environment Isolation",
        text: "Separate configuration and execution contexts per environment.",
        status: "planned",
      },
      {
        name: "Advanced Enterprise Controls",
        text: "Additional governance options for larger organizations.",
        status: "planned",
      },
    ],
  },
];

export function SecurityRoadmap() {
  return (
    <section id="roadmap" className="py-20 sm:py-28" aria-labelledby="roadmap-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs text-highlight">Roadmap</p>
          <h2
            id="roadmap-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Security evolves with the platform.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Security capabilities land in stages. Anything not marked
            &ldquo;Available&rdquo; is not part of the product yet — this
            roadmap is direction, not a checklist of shipping dates.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {columns.map((column, ci) => {
            const meta = statusMeta[column.status];
            return (
              <Reveal key={column.status} delay={ci * 110}>
                <div className="h-full rounded-[10px] border border-line bg-surface/60">
                  <div className="flex items-center gap-2.5 border-b border-line/70 px-4 py-3">
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden />
                    <span className="text-[13px] font-semibold text-fg">{meta.label}</span>
                    <span className="ml-auto rounded-full border border-line bg-raised px-2 py-0.5 font-mono text-[9.5px] text-muted">
                      {column.items.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-line/40">
                    {column.items.map((item) => (
                      <li key={item.name} className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-fg">{item.name}</span>
                          <span
                            className={`ml-auto rounded-full border px-1.5 py-0.5 font-mono text-[9px] ${meta.pill} md:hidden`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted">{item.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-4 font-mono text-[10.5px] text-muted/60">
          Statuses reflect the current build; items may change before they
          ship.
        </p>
      </div>
    </section>
  );
}
