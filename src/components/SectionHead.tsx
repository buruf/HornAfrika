import Link from "next/link";
import { IconArrowRight } from "@/components/icons";

type Props = {
  title: string;
  note?: string;
  href?: string;
  hrefLabel?: string;
  light?: boolean;
  accent?: string;
  icon?: React.ReactNode;
};

export function SectionHead({
  title,
  note,
  href,
  hrefLabel = "View all",
  light = false,
  accent,
  icon,
}: Props) {
  return (
    <div
      className={`section-head ${light ? "section-head--light" : ""}`}
      style={accent ? { borderBottomColor: accent } : undefined}
    >
      {icon}
      <h2 className="section-title">{title}</h2>
      {note && <span className="section-note hidden sm:inline">{note}</span>}
      {href && (
        <Link href={href} className="section-more inline-flex items-center gap-1.5">
          {hrefLabel}
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
