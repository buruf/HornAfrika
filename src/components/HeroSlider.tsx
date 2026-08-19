"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The front-page hero, as a rotating set of slides.
 *
 * It used to be a single article pinned to a homepage slot, so it never
 * changed — the same headline sat at the top of the site for days, which is
 * what made a live news site read as abandoned.
 *
 * The slides themselves are rendered on the server and passed in as children,
 * so this component holds no data and no fetching: it only decides which one
 * is on screen. That keeps the hero's markup exactly as it was — the same
 * card, the same gradient, the same type — and adds only the rotation.
 *
 * Restraint, matching the breaking ticker: it advances slowly, pauses on hover
 * and on keyboard focus, and does not move at all for a reader who has asked
 * for reduced motion. Every slide stays in the DOM so the arrows and dots work
 * without motion, and so a crawler sees all of them.
 */
export function HeroSlider({
  children,
  intervalMs = 7000,
}: {
  children: React.ReactNode[];
  intervalMs?: number;
}) {
  const slides = children.filter(Boolean);
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [slides.length, intervalMs]);

  if (slides.length === 0) return null;
  if (slides.length === 1) return <>{slides[0]}</>;

  return (
    <div
      className="group/slider relative isolate"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onFocusCapture={() => (pausedRef.current = true)}
      onBlurCapture={() => (pausedRef.current = false)}
      aria-roledescription="carousel"
      aria-label="Top stories"
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          // Kept mounted rather than unmounted: the hero is the largest image
          // on the page and remounting it re-triggers a load on every advance.
          className={i === index ? "block" : "hidden"}
          aria-hidden={i !== index}
        >
          {slide}
        </div>
      ))}

      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Previous story"
        className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-black/45 text-white opacity-0 transition-opacity hover:bg-black/70 focus-visible:opacity-100 group-hover/slider:opacity-100"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Next story"
        className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-black/45 text-white opacity-0 transition-opacity hover:bg-black/70 focus-visible:opacity-100 group-hover/slider:opacity-100"
      >
        ›
      </button>

      {/* Sits above the card's own bottom padding, clear of the headline. */}
      <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Story ${i + 1} of ${slides.length}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
