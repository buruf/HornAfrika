import { editorialImageMarkup } from "@/lib/editorial-image";

type Props = {
  seed: string;
  category?: string;
  /** Real photography from the CMS wins whenever it exists. */
  src?: string | null;
  alt: string;
  className?: string;
  /** Skyline detail is noise at thumbnail size. */
  detail?: boolean;
  priority?: boolean;
};

/**
 * Renders an article's image. Inline SVG rather than an <img> so there is no
 * second request, no decode cost and no layout shift on a slow connection.
 */
export function EditorialImage({
  seed,
  category = "default",
  src,
  alt,
  className = "",
  detail = true,
  priority = false,
}: Props) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 1200 675"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={alt}
      className={className}
      dangerouslySetInnerHTML={{
        __html: editorialImageMarkup(seed, category, { detail }),
      }}
    />
  );
}
