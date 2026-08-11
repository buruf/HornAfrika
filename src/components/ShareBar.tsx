"use client";

import { useState } from "react";
import { IconFacebook, IconX } from "@/components/icons";

export function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;
  const links = [
    { label: "Share on X", href: `https://x.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`, Icon: IconX },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, Icon: IconFacebook },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2 no-print">
      <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-ink-mute">
        Share
      </span>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-8 w-8 items-center justify-center border border-rule-strong text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          <Icon className="h-[15px] w-[15px]" />
        </a>
      ))}
      <a
        href={`mailto:?subject=${enc(title)}&body=${enc(url)}`}
        aria-label="Share by email"
        className="flex h-8 w-8 items-center justify-center border border-rule-strong text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-[15px] w-[15px]">
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="m3.5 6.5 8.5 6 8.5-6" />
        </svg>
      </a>
      <button
        type="button"
        onClick={copy}
        className="border border-rule-strong px-2.5 py-1.5 text-[0.72rem] font-bold text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
