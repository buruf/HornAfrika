export const SITE = {
  name: "HORNAFRIKA",
  tagline: "The Horn of Africa, Connected.",
  description:
    "Independent news and information from Somalia, Ethiopia, Djibouti and Eritrea. Politics, business, security, culture and the regional story that connects the Horn of Africa.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3040",
  newsletter: {
    name: "The Horn Daily",
    pitch: "Your daily briefing from Somalia, Ethiopia, Djibouti and Eritrea.",
  },
} as const;
