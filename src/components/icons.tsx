type P = { className?: string };
const base = "currentColor";

export const IconSearch = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="2" strokeLinecap="round" className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconMenu = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="2" strokeLinecap="round" className={className}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const IconClose = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="2" strokeLinecap="round" className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconChevron = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconArrowRight = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconArrowLeft = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const IconBolt = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill={base} className={className}>
    <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />
  </svg>
);

export const IconTrend = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);

export const IconPlay = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill={base} className={className}>
    <path d="M8 5v14l11-7-11-7Z" />
  </svg>
);

export const IconClock = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="2" strokeLinecap="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconFacebook = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill={base} className={className}>
    <path d="M14 9V7.5c0-.7.3-1 1-1h1.5V4H14c-2.2 0-3.5 1.3-3.5 3.4V9H8.5v2.6h2V20h3v-8.4h2.2l.4-2.6H13.5Z" />
  </svg>
);

export const IconX = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill={base} className={className}>
    <path d="M17.5 4h2.7l-5.9 6.8L21 20h-5.3l-4.2-5.4L6.7 20H4l6.3-7.2L3.5 4H9l3.8 5 4.7-5Zm-.9 14.4h1.5L8.4 5.5H6.8l9.8 12.9Z" />
  </svg>
);

export const IconYouTube = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill={base} className={className}>
    <path d="M21.6 7.9a2.5 2.5 0 0 0-1.8-1.8C18.2 5.7 12 5.7 12 5.7s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.9C2 9.5 2 12 2 12s0 2.5.4 4.1a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.1.4-4.1s0-2.5-.4-4.1ZM10 15.1V8.9l5.2 3.1-5.2 3.1Z" />
  </svg>
);

export const IconInstagram = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="1.9" className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17" cy="7" r="1.1" fill={base} stroke="none" />
  </svg>
);

export const IconTikTok = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill={base} className={className}>
    <path d="M16.5 3c.3 1.9 1.5 3.3 3.5 3.5v2.4c-1.3.1-2.5-.3-3.6-1v5.7c0 3.3-2.4 5.4-5.2 5.4-3 0-5.2-2.3-5.2-5.1 0-3 2.4-5.2 5.5-5v2.6c-.3-.1-.6-.1-1-.1-1.4 0-2.5 1.1-2.5 2.5s1.1 2.6 2.4 2.6c1.4 0 2.5-1 2.5-2.6V3h3.6Z" />
  </svg>
);

export const IconInfo = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="1.8" strokeLinecap="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

export const IconDoc = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);

export const IconMail = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6 8.5-6" />
  </svg>
);

export const IconPen = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="M14.5 5.5 18.5 9.5" />
  </svg>
);

export const IconGlobe = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="1.8" className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
  </svg>
);

export const IconBriefcase = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={base} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="7.5" width="18" height="12" rx="2" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12h18" />
  </svg>
);
