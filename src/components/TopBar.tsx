import Link from "next/link";
import {
  IconFacebook,
  IconInstagram,
  IconTikTok,
  IconX,
  IconYouTube,
} from "@/components/icons";

/**
 * The site publishes in English only.
 *
 * This slot previously listed six languages as links. None of them did
 * anything — nothing read the `lang` parameter — so every page advertised
 * Somali, Arabic, Amharic, Tigrinya and French and delivered English. On a
 * platform whose case rests on being trustworthy, that is the wrong kind of
 * promise to leave lying around. The slot now states what is true and links to
 * the plan.
 */

const SOCIALS = [
  { label: "Facebook", Icon: IconFacebook },
  { label: "X", Icon: IconX },
  { label: "YouTube", Icon: IconYouTube },
  { label: "Instagram", Icon: IconInstagram },
  { label: "TikTok", Icon: IconTikTok },
];

export function TopBar() {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-navy-deep text-white/85 no-print">
      <div className="shell flex h-9 items-center gap-4 text-[0.72rem]">
        <span className="font-semibold tracking-wide whitespace-nowrap">{today}</span>

        <span className="hidden h-3 w-px bg-white/20 sm:block" />

        {/* The screenshot carries a live temperature here. We do not publish a
            figure we cannot source, so the slot holds capital quick-links
            until a weather provider is connected (spec §32). */}
        <nav className="hidden items-center gap-3 text-white/60 sm:flex" aria-label="Capitals">
          {[
            ["Mogadishu", "/somalia"],
            ["Addis Ababa", "/ethiopia"],
            ["Djibouti City", "/djibouti"],
            ["Asmara", "/eritrea"],
          ].map(([label, href]) => (
            <Link key={label} href={href} className="hover:text-white whitespace-nowrap">
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <span className="font-semibold text-white">English</span>
          <span className="text-white/25">|</span>
          <Link href="/languages" className="text-white/70 hover:text-white">
            Other languages
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3 lg:ml-5">
          {SOCIALS.map(({ label, Icon }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="text-white/60 transition-colors hover:text-white"
            >
              <Icon className="h-[15px] w-[15px]" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
