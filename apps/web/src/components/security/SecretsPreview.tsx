import { Reveal } from "../landing/Reveal";
import { CloseIcon, EyeOffIcon, PlusIcon, RetryIcon } from "../landing/icons";

const secrets = [
  { name: "DATABASE_URL" },
  { name: "STRIPE_SECRET_KEY" },
  { name: "GITHUB_TOKEN" },
];

function SecretsPanel() {
  return (
    <div>
      <div className="overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_24px_80px_-24px_rgba(3,5,9,0.95)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-4 py-3">
          <p className="text-sm font-medium text-fg">Secrets</p>
          <span className="rounded border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
            production
          </span>
          <span className="ml-auto font-mono text-[10.5px] text-muted/70">
            {secrets.length} keys
          </span>
        </div>

        {/* Secret rows */}
        <ul className="p-2">
          {secrets.map((secret) => (
            <li
              key={secret.name}
              className="flex items-center gap-3 rounded-md px-2.5 py-3 transition-colors duration-200 hover:bg-hover/60"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden />
              <span className="truncate font-mono text-xs text-fg">{secret.name}</span>
              <span className="ml-auto flex items-center gap-2.5">
                <span
                  className="select-none font-mono text-xs tracking-[0.18em] text-muted/80"
                  aria-label="value hidden"
                >
                  ••••••••••••••
                </span>
                <EyeOffIcon width={13} height={13} className="shrink-0 text-muted/60" />
              </span>
            </li>
          ))}
        </ul>

        {/* Actions — illustrative, not interactive */}
        <div
          aria-hidden
          className="flex flex-wrap items-center gap-2 border-t border-line/80 bg-raised/40 px-4 py-3"
        >
          <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-fg">
            <PlusIcon width={12} height={12} className="text-primary" />
            Add Secret
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-muted">
            <RetryIcon width={12} height={12} />
            Rotate
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-bad">
            <CloseIcon width={12} height={12} />
            Delete
          </span>
        </div>
      </div>
      <p className="mt-3 font-mono text-[10.5px] text-muted/60">
        Conceptual interface — illustrates the model, not a live console.
      </p>
    </div>
  );
}

export function SecretsPreview() {
  return (
    <section id="secrets" className="py-20 sm:py-28" aria-labelledby="secrets-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="font-mono text-xs text-highlight">Secrets &amp; credentials</p>
          <h2
            id="secrets-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Keep sensitive configuration separate.
          </h2>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted">
            Workflows often interact with APIs, databases, and external services.
            Runbolt should make it possible to keep credentials separate from the
            workflow logic that uses them.
          </p>
          <ul className="mt-6 space-y-2.5 font-mono text-xs text-muted">
            <li>
              <span className="text-ok">✓</span> referenced by name, never pasted
              into steps
            </li>
            <li>
              <span className="text-ok">✓</span> values rendered masked wherever
              they appear
            </li>
            <li>
              <span className="text-ok">✓</span> rotatable without rewriting
              workflow logic
            </li>
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <SecretsPanel />
        </Reveal>
      </div>
    </section>
  );
}
