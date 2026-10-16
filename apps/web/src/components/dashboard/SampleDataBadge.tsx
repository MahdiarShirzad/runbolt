export function SampleDataBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-warn"
      title="The Runbolt API is not connected yet — dashboard widgets show deterministic sample data."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-warn" aria-hidden />
      Sample data
    </span>
  );
}
