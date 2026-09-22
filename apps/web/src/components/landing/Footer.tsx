import { BoltIcon } from "./icons";

const columns: { title: string; links: string[] }[] = [
  { title: "Product", links: ["Workflow Builder", "Background Workers", "Observability", "Pricing"] },
  { title: "Developers", links: ["Documentation", "API Reference", "CLI", "Changelog"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
];

export function Footer() {
  return (
    <footer className="border-t border-line/70 bg-surface/30">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <a href="#top" className="flex items-center gap-2.5 rounded-md">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-highlight text-white">
                <BoltIcon width={14} height={14} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">Runbolt</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Workflow orchestration for engineers. Build, run, and observe —
              from trigger to worker.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-line bg-code px-2.5 py-1 font-mono text-[11px] text-muted">
              <span className="blink h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
              All systems operational
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-[13px] font-semibold text-fg">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors duration-200 hover:text-fg"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line/70 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Runbolt, Inc. All rights reserved.</p>
          <p className="font-mono">
            status: <span className="text-ok">operational</span> · region:{" "}
            <span className="text-fg">global</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
