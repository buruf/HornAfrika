"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { IconArrowLeft, IconArrowRight, IconBolt } from "@/components/icons";

export type TickerItem = { href: string; headline: string };

/**
 * A restrained breaking-news strip (spec §5). It scrolls rather than flashes,
 * pauses on hover and focus, and does nothing at all when the reader has asked
 * for reduced motion.
 */
export function BreakingTicker({ items }: { items: TickerItem[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  const scrollBy = useCallback((dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * Math.max(240, rail.clientWidth * 0.6), behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      const rail = railRef.current;
      if (!rail || pausedRef.current) return;
      const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
      if (atEnd) rail.scrollTo({ left: 0, behavior: "smooth" });
      else rail.scrollBy({ left: rail.clientWidth * 0.55, behavior: "smooth" });
    }, 6000);

    return () => window.clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-rule bg-white no-print">
      <div className="shell flex items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-brand px-3 py-2 text-white sm:px-4">
          <IconBolt className="h-3.5 w-3.5" />
          <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] sm:text-[0.72rem]">
            Breaking News
          </span>
        </div>

        <div
          ref={railRef}
          className="rail flex flex-1 items-center gap-0 py-2 pl-4"
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          onFocusCapture={() => (pausedRef.current = true)}
          onBlurCapture={() => (pausedRef.current = false)}
          aria-label="Breaking news headlines"
        >
          {items.map((item, i) => (
            <span key={item.href} className="flex shrink-0 items-center">
              {i > 0 && <span className="px-4 text-rule-strong" aria-hidden>•</span>}
              <Link
                href={item.href}
                className="whitespace-nowrap text-[0.84rem] font-semibold text-ink hover:text-brand"
              >
                {item.headline}
              </Link>
            </span>
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-1 pl-3 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Previous headlines"
            className="border border-rule p-1 text-ink-mute transition-colors hover:border-ink hover:text-ink"
          >
            <IconArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Next headlines"
            className="border border-rule p-1 text-ink-mute transition-colors hover:border-ink hover:text-ink"
          >
            <IconArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
