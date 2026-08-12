import Link from "next/link";
import type { Locale } from "@prisma/client";
import { LOCALES } from "@/lib/locales";

/**
 * Offers only the languages this particular article actually exists in.
 *
 * A switcher listing six languages that mostly resolve to English is the same
 * broken promise as the dead selector this replaced. If a piece has only been
 * translated into Somali, Somali is the only thing offered.
 */
export function LanguageSwitcher({
  available,
  current,
  hrefFor,
}: {
  available: Locale[];
  current: Locale;
  hrefFor: (locale: Locale) => string;
}) {
  if (available.length < 2) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-y border-rule py-2.5 no-print">
      <span className="text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-ink-mute">
        Read in
      </span>
      {available.map((l) => {
        const info = LOCALES[l];
        const isCurrent = l === current;
        return (
          <Link
            key={l}
            href={hrefFor(l)}
            hrefLang={info.tag}
            lang={info.tag}
            dir={info.dir}
            aria-current={isCurrent ? "true" : undefined}
            className={`border px-2.5 py-1 text-[0.8rem] font-semibold transition-colors ${
              isCurrent
                ? "border-ink bg-ink text-white"
                : "border-rule-strong text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {info.nativeName}
          </Link>
        );
      })}
    </div>
  );
}
