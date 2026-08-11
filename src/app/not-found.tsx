import Link from "next/link";
import { MarkCape } from "@/components/brand";

/**
 * Root 404, used for addresses that match no route segment at all. Pages under
 * the (site) group have their own richer not-found with the full site chrome.
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-shell px-5">
      <div className="max-w-lg text-center">
        <div className="mb-4 flex justify-center">
          <MarkCape size={56} />
        </div>
        <Link href="/" className="text-[1.8rem] font-extrabold tracking-[-0.03em]">
          <span className="text-ink">HORN</span>
          <span className="text-brand">AFRIKA</span>
        </Link>
        <p className="mt-6 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-brand">
          404
        </p>
        <h1 className="mt-1.5 text-[2rem] font-extrabold tracking-[-0.03em]">
          That page isn’t here
        </h1>
        <p className="mt-3 text-[1rem] leading-relaxed text-ink-soft">
          The address may have changed, or the story may have been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-brand px-6 py-2.5 text-[0.76rem] font-extrabold uppercase tracking-[0.08em] text-white hover:bg-brand-dark"
        >
          Go to the homepage
        </Link>
      </div>
    </div>
  );
}
