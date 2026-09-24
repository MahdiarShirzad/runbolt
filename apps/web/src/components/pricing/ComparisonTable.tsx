import { Reveal } from "../landing/Reveal";
import { SectionHeader } from "../ui/kit";
import { CheckIcon } from "../landing/icons";

type CellValue = { type: "check" } | { type: "none" } | { type: "text"; value: string };

const rows: { capability: string; values: [CellValue, CellValue, CellValue] }[] = [
  { capability: "Workflow builder", values: [{ type: "check" }, { type: "check" }, { type: "check" }] },
  { capability: "API access", values: [{ type: "check" }, { type: "check" }, { type: "check" }] },
  {
    capability: "Execution history",
    values: [{ type: "text", value: "7 days" }, { type: "text", value: "90 days" }, { type: "text", value: "Custom" }],
  },
  {
    capability: "Logs",
    values: [{ type: "text", value: "Basic" }, { type: "text", value: "Advanced" }, { type: "text", value: "Advanced" }],
  },
  { capability: "Background workers", values: [{ type: "none" }, { type: "check" }, { type: "check" }] },
  {
    capability: "Integrations",
    values: [{ type: "text", value: "Core" }, { type: "text", value: "All" }, { type: "text", value: "All + custom" }],
  },
  { capability: "Team collaboration", values: [{ type: "none" }, { type: "check" }, { type: "check" }] },
  { capability: "Advanced security", values: [{ type: "none" }, { type: "none" }, { type: "check" }] },
  {
    capability: "Support",
    values: [{ type: "text", value: "Community" }, { type: "text", value: "Priority" }, { type: "text", value: "Dedicated" }],
  },
];

function Cell({ value, strong }: { value: CellValue; strong?: boolean }) {
  if (value.type === "check") {
    return (
      <span className="inline-flex justify-center" aria-label="Included">
        <CheckIcon width={14} height={14} className={strong ? "text-primary" : "text-ok/80"} />
      </span>
    );
  }
  if (value.type === "none") {
    return (
      <span className="inline-flex justify-center text-muted/40" aria-label="Not included">
        —
      </span>
    );
  }
  return (
    <span className={`text-[13px] ${strong ? "text-fg" : "text-muted"}`}>{value.value}</span>
  );
}

export function ComparisonTable() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="compare-heading">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            id="compare-heading"
            eyebrow="Comparison"
            title="Compare capabilities"
          />
        </Reveal>

        <Reveal delay={120} className="mt-10">
          <div className="scroll-slim overflow-x-auto rounded-xl border border-line bg-surface/60">
            <table className="w-full min-w-[600px] border-collapse text-left">
              <caption className="sr-only">
                Feature comparison across Developer, Team, and Enterprise plans
              </caption>
              <thead>
                <tr className="border-b border-line bg-raised/50">
                  <th scope="col" className="px-5 py-3.5 text-[13px] font-medium text-muted">
                    Capability
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center text-[13px] font-medium text-muted">
                    Developer
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center text-[13px] font-medium text-primary">
                    Team
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center text-[13px] font-medium text-muted">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.capability}
                    className={i % 2 === 1 ? "bg-code/40" : undefined}
                  >
                    <th scope="row" className="px-5 py-3.5 text-[13.5px] font-normal text-fg">
                      {row.capability}
                    </th>
                    {row.values.map((value, j) => (
                      <td
                        key={j}
                        className={`px-4 py-3.5 text-center ${j === 1 ? "bg-primary/[0.04]" : ""}`}
                      >
                        <Cell value={value} strong={j === 1} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
