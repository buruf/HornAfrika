/**
 * Country flags as inline SVG.
 *
 * Regional-indicator emoji (🇸🇴) render as bare letters on Windows, which is a
 * large share of readers, so the flags are drawn rather than typed. Simplified
 * to the essential devices so they stay legible at 16px in a nav bar.
 */

type Props = { slug: string; className?: string; title?: string };

function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const pts: string[] = [];
  for (let i = 0; i < 5; i++) {
    const outer = (i * 72 - 90) * (Math.PI / 180);
    const inner = (i * 72 - 90 + 36) * (Math.PI / 180);
    pts.push(`${(cx + r * Math.cos(outer)).toFixed(2)},${(cy + r * Math.sin(outer)).toFixed(2)}`);
    pts.push(
      `${(cx + r * 0.382 * Math.cos(inner)).toFixed(2)},${(cy + r * 0.382 * Math.sin(inner)).toFixed(2)}`,
    );
  }
  return <polygon points={pts.join(" ")} fill={fill} />;
}

export function CountryFlag({ slug, className = "", title }: Props) {
  const common = {
    viewBox: "0 0 30 20",
    className: `inline-block h-[1em] w-[1.5em] shrink-0 align-[-0.13em] ${className}`,
    role: "img" as const,
    "aria-label": title ?? `${slug} flag`,
  };

  switch (slug) {
    case "somalia":
      return (
        <svg {...common}>
          <rect width="30" height="20" fill="#4189dd" />
          <Star cx={15} cy={10} r={6} fill="#ffffff" />
        </svg>
      );

    case "ethiopia":
      return (
        <svg {...common}>
          <rect width="30" height="20" fill="#078930" />
          <rect y="6.67" width="30" height="6.66" fill="#fcdd09" />
          <rect y="13.33" width="30" height="6.67" fill="#da121a" />
          <circle cx="15" cy="10" r="6" fill="#0f47af" />
          <Star cx={15} cy={10} r={4.4} fill="#fcdd09" />
        </svg>
      );

    case "djibouti":
      return (
        <svg {...common}>
          <rect width="30" height="10" fill="#6ab2e7" />
          <rect y="10" width="30" height="10" fill="#12ad2b" />
          <polygon points="0,0 0,20 13,10" fill="#ffffff" />
          <Star cx={4.6} cy={10} r={3.6} fill="#d7141a" />
        </svg>
      );

    case "eritrea":
      return (
        <svg {...common}>
          <polygon points="0,0 30,0 0,20" fill="#12ad2b" />
          <polygon points="30,0 30,20 0,20" fill="#4189dd" />
          <polygon points="0,0 30,10 0,20" fill="#ea0437" />
          <circle cx="7.5" cy="10" r="3.4" fill="none" stroke="#ffc726" strokeWidth="1.5" />
          <circle cx="7.5" cy="10" r="1.1" fill="#ffc726" />
        </svg>
      );

    default:
      // The Horn as a whole — no single flag applies.
      return (
        <svg {...common}>
          <rect width="30" height="20" fill="#0f2942" />
          <circle cx="15" cy="10" r="5.5" fill="none" stroke="#ffffff" strokeWidth="1.4" />
          <path d="M4 10h22M15 4.5c2.6 2.9 2.6 8.1 0 11-2.6-2.9-2.6-8.1 0-11Z" stroke="#ffffff" strokeWidth="1.2" fill="none" />
        </svg>
      );
  }
}
