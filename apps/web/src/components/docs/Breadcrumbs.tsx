import Link from "next/link";

export function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12.5px]">
      {trail.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-line" aria-hidden>
              /
            </span>
          )}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="text-muted transition-colors hover:text-fg"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-fg">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
