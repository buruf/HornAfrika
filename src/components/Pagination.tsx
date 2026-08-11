import Link from "next/link";

export function Pagination({
  page,
  total,
  perPage,
  basePath,
  query = {},
}: {
  page: number;
  total: number;
  perPage: number;
  basePath: string;
  query?: Record<string, string>;
}) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams(query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Window of pages around the current one, always including first and last.
  const window = new Set<number>([1, pages, page - 1, page, page + 1]);
  const list = [...window].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          className="border border-rule-strong px-3 py-1.5 text-[0.78rem] font-semibold hover:border-ink"
        >
          Previous
        </Link>
      )}
      {list.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && list[i - 1] !== p - 1 && (
            <span className="px-1 text-ink-mute">…</span>
          )}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={`min-w-[34px] border px-2.5 py-1.5 text-center text-[0.78rem] font-semibold ${
              p === page
                ? "border-ink bg-ink text-white"
                : "border-rule-strong hover:border-ink"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link
          href={href(page + 1)}
          className="border border-rule-strong px-3 py-1.5 text-[0.78rem] font-semibold hover:border-ink"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
