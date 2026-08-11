"use client";

import { useEffect, useRef, useState } from "react";
import { IconClose, IconSearch } from "@/components/icons";

export function SearchToggle() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      // "/" focuses search, the convention on every news site worth using.
      if (e.key === "/" && !open) {
        const t = e.target as HTMLElement;
        if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative flex items-center">
      {open ? (
        <form action="/search" className="flex items-center gap-1.5">
          <div className="flex items-center gap-2 border-b-2 border-ink px-1 py-1">
            <IconSearch className="h-4 w-4 text-ink-mute" />
            <input
              ref={inputRef}
              name="q"
              type="search"
              placeholder="Search articles, countries, topics…"
              className="w-52 bg-transparent text-[0.88rem] outline-none xl:w-64"
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close search"
            className="p-1 text-ink-mute hover:text-ink"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search"
          title="Search  ( / )"
          className="p-1.5 text-ink transition-colors hover:text-brand"
        >
          <IconSearch className="h-[22px] w-[22px]" />
        </button>
      )}
    </div>
  );
}
