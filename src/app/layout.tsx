import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";

/**
 * Root layout carries only the document shell. The public site chrome —
 * header, breaking ticker, footer — lives in the (site) group, so the CMS
 * under /admin renders in its own frame rather than inside the newspaper.
 */

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "Horn of Africa news",
    "Somalia news",
    "Ethiopia news",
    "Djibouti news",
    "Eritrea news",
    "Red Sea",
    "East Africa",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_GB",
    url: SITE.url,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a1c2e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
