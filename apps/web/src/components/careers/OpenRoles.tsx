import { Reveal } from "../landing/Reveal";
import { SectionHeader } from "../ui/kit";
import { ArrowRightIcon } from "../landing/icons";

type Role = {
  title: string;
  team: string;
  type: string;
  focus: string;
  looking: string[];
};

const roles: Role[] = [
  {
    title: "Founding Backend Engineer",
    team: "execution engine",
    type: "full-time · remote",
    focus:
      "Own the core: the DAG resolver, BullMQ workers, and the PostgreSQL state machine that keeps executions race-free.",
    looking: [
      "Distributed systems in production — queues, locking, at-least-once semantics",
      "TypeScript, PostgreSQL, and Redis at the level where you reason about failure modes",
    ],
  },
  {
    title: "Product Engineer",
    team: "builder & platform",
    type: "full-time · remote",
    focus:
      "Shape the visual workflow builder, execution dashboards, and the day-to-day surfaces developers live in.",
    looking: [
      "React/Next.js craft — complex state, real-time UIs, and interfaces that stay fast",
      "Care about the details developers touch every day: labels, empty states, feedback",
    ],
  },
  {
    title: "Developer Experience Engineer",
    team: "developer tooling",
    type: "full-time · remote",
    focus:
      "Build the CLI, the typed SDKs, and the docs — the surfaces that decide whether the platform feels like a tool or a chore.",
    looking: [
      "You've shipped developer tooling or written docs engineers actually praise",
      "Comfortable living at the boundary of API design and documentation",
    ],
  },
];

function RoleCard({ role }: { role: Role }) {
  return (
    <article className="group grid gap-4 border-t border-line/70 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted/70">
          {role.team}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-fg transition-colors duration-200 group-hover:text-primary sm:text-2xl">
          {role.title}
        </h3>
        <p className="mt-1.5 font-mono text-xs text-faint">{role.type}</p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          {role.focus}
        </p>
      </div>

      <div className="flex flex-col justify-between gap-6">
        <ul className="space-y-2.5">
          {role.looking.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted">
              <span className="mt-2 h-1 w-1 shrink-0 bg-primary/70" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <a
          href={`mailto:careers@runbolt.dev?subject=${encodeURIComponent(`Application — ${role.title}`)}`}
          className="inline-flex items-center gap-1.5 self-start rounded-md border border-line bg-raised px-4 py-2 text-sm font-medium text-fg transition-colors duration-200 hover:border-line-strong hover:bg-hover group-hover:border-line-strong"
        >
          Apply for this role
          <ArrowRightIcon
            width={14}
            height={14}
            className="text-muted transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </article>
  );
}

export function OpenRoles() {
  return (
    <section id="roles" className="border-y border-line/70 bg-surface/40 py-20 sm:py-28" aria-labelledby="roles-heading">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            id="roles-heading"
            eyebrow="Open roles"
            title="Three ways in."
            lede="Every role works directly on the product. Applications are read by the people you'd work with — tell us what you've built and what broke along the way."
          />
        </Reveal>

        <Reveal delay={120} className="mt-10">
          {roles.map((role) => (
            <RoleCard key={role.title} role={role} />
          ))}
          <div className="border-t border-line/70" aria-hidden />
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 font-mono text-xs text-faint">
            Nothing that fits? Write to{" "}
            <a
              href="mailto:careers@runbolt.dev"
              className="text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-primary"
            >
              careers@runbolt.dev
            </a>{" "}
            anyway — strong traces beat keyword matches.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
