import { Reveal } from "../landing/Reveal";
import { CheckIcon } from "../landing/icons";
import { UsersIcon } from "./icons";

type Role = {
  name: string;
  grants: [boolean, boolean, boolean, boolean, boolean];
};

const capabilities = ["create", "edit", "execute", "inspect", "administer"] as const;

const members = [
  { user: "ana", team: "platform", role: "Developer", access: "edit + run" },
  { user: "sam", team: "growth", role: "Viewer", access: "inspect" },
];

const roles: Role[] = [
  { name: "Owner", grants: [true, true, true, true, true] },
  { name: "Admin", grants: [true, true, true, true, true] },
  { name: "Developer", grants: [true, true, true, true, false] },
  { name: "Viewer", grants: [false, false, false, true, false] },
];

function AccessPanel() {
  return (
    <div>
      <div className="overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_24px_80px_-24px_rgba(3,5,9,0.95)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 py-3">
          <UsersIcon width={14} height={14} className="text-accent" />
          <p className="text-sm font-medium text-fg">Access</p>
          <span className="ml-auto font-mono text-[10.5px] text-muted/70">
            team workspace
          </span>
        </div>

        {/* Members strip: user / team / role / permission */}
        <div className="scroll-slim overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead>
              <tr className="border-b border-line/60 font-mono text-[10px] uppercase tracking-wider text-muted/60">
                <th scope="col" className="px-4 py-2 font-normal">user</th>
                <th scope="col" className="px-4 py-2 font-normal">team</th>
                <th scope="col" className="px-4 py-2 font-normal">role</th>
                <th scope="col" className="px-4 py-2 font-normal">permission</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.user}
                  className="border-b border-line/40 transition-colors duration-200 last:border-b-0 hover:bg-hover/50"
                >
                  <td className="px-4 py-2.5 font-mono text-fg">{m.user}</td>
                  <td className="px-4 py-2.5 font-mono text-muted">{m.team}</td>
                  <td className="px-4 py-2.5 font-mono text-muted">{m.role}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded border border-line bg-raised px-1.5 py-0.5 font-mono text-[10px] text-highlight">
                      {m.access}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Permission matrix */}
        <div className="border-t border-line/80 bg-code/60">
          <div className="scroll-slim overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-xs">
              <caption className="sr-only">
                Illustrative permission matrix: capabilities granted per role
              </caption>
              <thead>
                <tr className="border-b border-line/60 font-mono text-[10px] uppercase tracking-wider text-muted/60">
                  <th scope="col" className="px-4 py-2.5 font-normal">role</th>
                  {capabilities.map((cap) => (
                    <th scope="col" key={cap} className="px-3 py-2.5 text-center font-normal">
                      {cap}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr
                    key={role.name}
                    className="border-b border-line/40 transition-colors duration-200 last:border-b-0 hover:bg-hover/50"
                  >
                    <th
                      scope="row"
                      className="px-4 py-2.5 font-mono text-[11px] font-normal text-fg"
                    >
                      {role.name}
                    </th>
                    {role.grants.map((granted, i) => (
                      <td key={capabilities[i]} className="px-3 py-2.5 text-center">
                        {granted ? (
                          <>
                            <CheckIcon
                              width={12}
                              height={12}
                              className="mx-auto text-ok"
                            />
                            <span className="sr-only">allowed</span>
                          </>
                        ) : (
                          <>
                            <span className="text-muted/50" aria-hidden>
                              —
                            </span>
                            <span className="sr-only">not allowed</span>
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className="mt-3 font-mono text-[10.5px] text-muted/60">
        Illustrative role model — how access is shaped, not a live console.
      </p>
    </div>
  );
}

export function AccessControlPreview() {
  return (
    <section id="access" className="py-20 sm:py-28" aria-labelledby="access-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal delay={120} className="lg:order-1">
          <AccessPanel />
        </Reveal>

        <Reveal className="lg:order-2">
          <p className="font-mono text-xs text-highlight">Authentication &amp; access</p>
          <h2
            id="access-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Control who can access your workflows.
          </h2>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted">
            Access controls can define who is allowed to create, edit, execute,
            or inspect workflows. Roles map to what people actually do —
            building, running, or reviewing — organized around teams rather than
            a single all-or-nothing switch.
          </p>
          <ul className="mt-6 space-y-2.5 font-mono text-xs text-muted">
            <li>
              <span className="text-ok">✓</span> owners, admins, developers,
              viewers
            </li>
            <li>
              <span className="text-ok">✓</span> capabilities split from
              membership
            </li>
            <li>
              <span className="text-ok">✓</span> permissions that read like the
              work
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
