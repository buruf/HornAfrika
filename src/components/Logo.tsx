import Link from "next/link";
import { MarkCape } from "@/components/brand";

/**
 * The HORNAFRIKA lockup: the Cape mark plus the wordmark.
 *
 * The mark is the outline of the four countries, generated from the same
 * boundary data as the site map (see scripts/build-horn-map.mjs), so the logo
 * and the map can never drift apart.
 */
export function Logo({
  compact = false,
  tone = "light",
}: {
  compact?: boolean;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2.5"
      aria-label="HORNAFRIKA — home"
    >
      <MarkCape size={compact ? 32 : 44} tone={tone} />

      <span className="block">
        <span
          className={`block font-extrabold leading-none tracking-[-0.035em] ${
            compact ? "text-[1.35rem]" : "text-[1.75rem] sm:text-[2rem]"
          }`}
        >
          <span className={dark ? "text-white" : "text-ink"}>HORN</span>
          <span className="text-brand">AFRIKA</span>
        </span>
        {!compact && (
          <span
            className={`mt-1 block text-[0.58rem] font-semibold uppercase tracking-[0.14em] ${
              dark ? "text-white/60" : "text-ink-mute"
            }`}
          >
            The Horn of Africa, Connected.
          </span>
        )}
      </span>
    </Link>
  );
}
