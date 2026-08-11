import Link from "next/link";
import { CountryFlag } from "@/components/CountryFlag";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.72rem] text-ink-mute">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden className="text-rule-strong">/</span>}
            {c.href ? (
              <Link href={c.href} className="hover:text-brand">
                {c.label}
              </Link>
            ) : (
              <span className="text-ink-soft">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  blurb,
  accent,
  countrySlug,
  meta,
  children,
}: {
  eyebrow?: string;
  title: string;
  blurb?: string | null;
  accent?: string;
  /** Renders the country's flag beside the title. */
  countrySlug?: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header
      className="border-b-[3px] pb-5"
      style={{ borderBottomColor: accent ?? "var(--color-ink)" }}
    >
      {eyebrow && (
        <p
          className="mb-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.14em]"
          style={{ color: accent ?? "var(--color-brand)" }}
        >
          {eyebrow}
        </p>
      )}
      <div className="flex flex-wrap items-baseline gap-3">
        {countrySlug && <CountryFlag slug={countrySlug} className="text-[2rem]" />}
        <h1 className="text-[1.9rem] font-extrabold tracking-[-0.03em] sm:text-[2.5rem]">
          {title}
        </h1>
        {meta}
      </div>
      {blurb && (
        <p className="mt-3 max-w-3xl text-[0.98rem] leading-relaxed text-ink-soft">
          {blurb}
        </p>
      )}
      {children}
    </header>
  );
}
