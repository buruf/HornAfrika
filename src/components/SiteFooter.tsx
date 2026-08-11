import Link from "next/link";
import { CountryFlag } from "@/components/CountryFlag";
import { MarkCape } from "@/components/brand";
import { getCountries } from "@/lib/queries";
import { NewsletterForm } from "@/components/NewsletterForm";
import {
  IconBriefcase,
  IconDoc,
  IconFacebook,
  IconGlobe,
  IconInfo,
  IconInstagram,
  IconMail,
  IconPen,
  IconTikTok,
  IconX,
  IconYouTube,
} from "@/components/icons";

const QUICK = [
  { label: "About Us", sub: "Who we are", href: "/about", Icon: IconInfo },
  { label: "Editorial Policy", sub: "Our standards", href: "/editorial-policy", Icon: IconDoc },
  { label: "Contact Us", sub: "Get in touch", href: "/contact", Icon: IconMail },
  { label: "Submit a Story", sub: "Share your story", href: "/submit-a-story", Icon: IconPen },
  { label: "Advertise", sub: "Work with us", href: "/advertise", Icon: IconGlobe },
  { label: "Jobs", sub: "Join our team", href: "/careers", Icon: IconBriefcase },
];

const SOCIALS = [
  { label: "Facebook", Icon: IconFacebook },
  { label: "X", Icon: IconX },
  { label: "YouTube", Icon: IconYouTube },
  { label: "Instagram", Icon: IconInstagram },
  { label: "TikTok", Icon: IconTikTok },
];

export async function SiteFooter() {
  const countries = await getCountries();

  return (
    <footer className="mt-12 no-print">
      {/* Quick-link strip — mirrors the utility row in the reference design. */}
      <div className="border-y border-rule bg-white">
        <div className="shell grid grid-cols-2 gap-x-6 gap-y-5 py-6 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK.map(({ label, sub, href, Icon }) => (
            <Link key={href} href={href} className="group flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rule-strong text-ink-soft transition-colors group-hover:border-brand group-hover:text-brand">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.76rem] font-extrabold uppercase tracking-[0.05em] text-ink group-hover:text-brand">
                  {label}
                </span>
                <span className="block text-[0.72rem] text-ink-mute">{sub}</span>
              </span>
            </Link>
          ))}

          <div className="col-span-2 flex items-center gap-3 sm:col-span-3 lg:col-span-6 lg:justify-end lg:border-t-0">
            <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-ink-mute">
              Follow Us
            </span>
            <div className="flex items-center gap-2.5">
              {SOCIALS.map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="text-ink-soft transition-colors hover:text-brand"
                >
                  <Icon className="h-[19px] w-[19px]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-navy-deep text-white">
        <div className="shell grid gap-10 py-11 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div>
            <MarkCape size={46} plate={false} tone="dark" />
            <p className="mt-3 text-[1.7rem] font-extrabold leading-none tracking-[-0.03em]">
              <span className="text-white">HORN</span>
              <span className="text-brand">AFRIKA</span>
            </p>
            <p className="mt-2 text-[0.8rem] text-white/60">The Horn of Africa, Connected.</p>
            <p className="mt-4 max-w-xs text-[0.83rem] leading-relaxed text-white/70">
              Independent news and information covering Somalia, Ethiopia, Djibouti and
              Eritrea — and the region they share.
            </p>
          </div>

          <div>
            <p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-white/50">
              Countries
            </p>
            <ul className="space-y-2">
              {countries.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} className="text-[0.86rem] text-white/80 hover:text-white">
                    <CountryFlag slug={c.slug} className="mr-2" />
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/horn" className="text-[0.86rem] text-white/80 hover:text-white">
                  Horn of Africa
                </Link>
              </li>
              <li>
                <Link href="/wire" className="text-[0.86rem] text-white/80 hover:text-white">
                  The Wire
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-white/50">
              The Company
            </p>
            <ul className="space-y-2">
              {[
                ["About", "/about"],
                ["Contact", "/contact"],
                ["Editorial Policy", "/editorial-policy"],
                ["Corrections", "/corrections"],
                ["Languages", "/languages"],
                ["Privacy", "/privacy"],
                ["Terms", "/terms"],
                ["Careers", "/careers"],
                ["Advertise", "/advertise"],
                ["Submit a Story", "/submit-a-story"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[0.86rem] text-white/80 hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.13em] text-white/50">
              The Horn Daily
            </p>
            <p className="mb-4 text-[0.85rem] leading-relaxed text-white/70">
              Your daily briefing from Somalia, Ethiopia, Djibouti and Eritrea.
            </p>
            <NewsletterForm variant="dark" showCountry />
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="shell flex flex-col gap-2 py-4 text-[0.75rem] text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Hornafrika. All rights reserved.</p>
            <p>
              Published independently. Read our{" "}
              <Link href="/editorial-policy" className="underline hover:text-white">
                editorial standards
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
