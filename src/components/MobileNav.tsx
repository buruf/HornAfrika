"use client";
import { CountryFlag } from "@/components/CountryFlag";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IconChevron, IconClose, IconMenu, IconSearch } from "@/components/icons";
import { Logo } from "@/components/Logo";

export type NavCountry = {
  slug: string;
  name: string;
  flag: string;
  regions: { slug: string; name: string }[];
};

export type NavCategory = { slug: string; name: string };

type Props = {
  countries: NavCountry[];
  categories: NavCategory[];
  more: NavCategory[];
};

export function MobileNav({ countries, categories, more }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="p-1.5 text-ink lg:hidden"
      >
        <IconMenu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
          <div className="flex items-center justify-between border-b border-rule px-5 py-3">
            <Logo compact />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="p-1.5"
            >
              <IconClose className="h-6 w-6" />
            </button>
          </div>

          <form action="/search" className="border-b border-rule px-5 py-3">
            <div className="flex items-center gap-2 border border-rule-strong px-3 py-2">
              <IconSearch className="h-4 w-4 text-ink-mute" />
              <input
                name="q"
                type="search"
                placeholder="Search the Horn…"
                className="w-full bg-transparent text-[0.95rem] outline-none"
              />
            </div>
          </form>

          <nav className="flex-1 overflow-y-auto pb-16">
            <Link href="/" className="block border-b border-rule px-5 py-3.5 text-[0.95rem] font-bold uppercase tracking-wide">
              Home
            </Link>

            {countries.map((c) => (
              <div key={c.slug} className="border-b border-rule">
                <div className="flex items-stretch">
                  <Link
                    href={`/${c.slug}`}
                    className="flex-1 px-5 py-3.5 text-[0.95rem] font-bold uppercase tracking-wide"
                  >
                    <CountryFlag slug={c.slug} className="mr-2" />
                    {c.name}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Toggle ${c.name} regions`}
                    aria-expanded={expanded === c.slug}
                    onClick={() => setExpanded(expanded === c.slug ? null : c.slug)}
                    className="px-5 text-ink-mute"
                  >
                    <IconChevron
                      className={`h-4 w-4 transition-transform ${expanded === c.slug ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                {expanded === c.slug && (
                  <div className="bg-shell px-5 pb-4 pt-1">
                    <p className="pb-1.5 pt-2 text-[0.65rem] font-bold uppercase tracking-[0.11em] text-ink-mute">
                      Regions
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {c.regions.map((r) => (
                        <Link
                          key={r.slug}
                          href={`/${c.slug}/regions/${r.slug}`}
                          className="text-[0.86rem] text-ink-soft"
                        >
                          {r.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {[...categories, ...more].map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="block border-b border-rule px-5 py-3.5 text-[0.95rem] font-bold uppercase tracking-wide"
              >
                {cat.name}
              </Link>
            ))}

            <div className="px-5 py-5">
              <p className="pb-2 text-[0.65rem] font-bold uppercase tracking-[0.11em] text-ink-mute">
                More
              </p>
              <div className="grid grid-cols-2 gap-y-2">
                {[
                  ["About", "/about"],
                  ["Contact", "/contact"],
                  ["Editorial Policy", "/editorial-policy"],
                  ["Corrections", "/corrections"],
                  ["Advertise", "/advertise"],
                  ["Submit a Story", "/submit-a-story"],
                ].map(([label, href]) => (
                  <Link key={href} href={href} className="text-[0.86rem] text-ink-soft">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
