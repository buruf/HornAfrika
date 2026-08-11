import { getActiveAd } from "@/lib/queries";

/**
 * Advertising positions (spec §22). A slot renders only when an administrator
 * has activated it — an inactive slot collapses to nothing rather than leaving
 * a reserved grey box. Editorial content stays the page's subject.
 */
export async function AdSlot({
  position,
  className = "",
}: {
  position: "header" | "homepage-mid" | "sidebar" | "in-article" | "footer";
  className?: string;
}) {
  const ad = await getActiveAd(position);
  if (!ad) return null;

  return (
    <aside className={`no-print ${className}`} aria-label="Advertisement">
      <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-mute">
        Advertisement
      </p>
      <div className="border border-rule bg-white p-3">
        {ad.linkUrl ? (
          <a href={ad.linkUrl} rel="nofollow sponsored noopener" target="_blank">
            {ad.label}
          </a>
        ) : (
          <span className="text-[0.85rem] text-ink-soft">{ad.label}</span>
        )}
      </div>
    </aside>
  );
}
