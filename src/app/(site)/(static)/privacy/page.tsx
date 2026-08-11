import type { Metadata } from "next";
import { H2, StaticPage } from "@/components/StaticPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What data Hornafrika collects, why, and how to have it removed.",
  alternates: { canonical: `${SITE.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Privacy"
      blurb="What we collect, why we collect it, and how to have it removed."
    >
      <H2>What we collect</H2>
      <p>
        <strong>Newsletter subscriptions.</strong> If you subscribe to The Horn Daily we
        store your email address, the edition you chose and any country preference. That is
        all we store, and it is used only to send the newsletter.
      </p>
      <p>
        <strong>Article readership.</strong> We record that an article was read, and when.
        These records are used to calculate the trending list. They are not linked to an
        identity, an account or an advertising profile.
      </p>

      <H2>What we do not do</H2>
      <p>
        We do not sell personal data. We do not build advertising profiles of readers. We
        do not require an account to read the site.
      </p>

      <H2>Cookies</H2>
      <p>
        The public site sets no tracking cookies. Signed-in staff using the content
        management system receive a session cookie, which is necessary for the CMS to work
        and is removed on sign-out.
      </p>

      <H2>Your rights</H2>
      <p>
        You can unsubscribe from any newsletter at any time using the link in the email, or
        by writing to us. On request we will tell you what we hold about you and delete it.
      </p>

      <H2>Contact</H2>
      <p>
        Privacy requests go to{" "}
        <a href="mailto:privacy@hornafrika.com" className="font-semibold text-brand underline">
          privacy@hornafrika.com
        </a>
        .
      </p>
    </StaticPage>
  );
}
