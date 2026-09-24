import { ChevronDownIcon } from "../landing/icons";

/**
 * Native disclosure FAQ item — a server component with zero JavaScript.
 * The `name` attribute groups items into an exclusive accordion (one open
 * at a time) natively; smooth height animation comes from CSS
 * `::details-content` where supported, instant toggle elsewhere.
 */
export function FaqItem({
  question,
  answer,
  name,
  defaultOpen = false,
}: {
  question: string;
  answer: string;
  /** Groups items into an exclusive (single-open) accordion. */
  name?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details
      name={name}
      open={defaultOpen || undefined}
      className="group border-b border-line/70"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[15px] font-medium text-fg transition-colors duration-200 [&::-webkit-details-marker]:hidden hover:text-primary">
        {question}
        <ChevronDownIcon
          width={16}
          height={16}
          className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <p className="pb-5 pr-8 text-sm leading-relaxed text-muted">{answer}</p>
    </details>
  );
}
