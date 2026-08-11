import Link from "next/link";
import { CountryFlag } from "@/components/CountryFlag";
import { getCountries } from "@/lib/queries";

export default async function NotFound() {
  const countries = await getCountries();

  return (
    <div className="shell py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-brand">
          404
        </p>
        <h1 className="mt-2 text-[2.2rem] font-extrabold tracking-[-0.03em] sm:text-[2.8rem]">
          That page isn’t here
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">
          The address may have changed, or the story may have been moved. Try one of the
          country sections, or search.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {countries.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="flex items-center gap-2 border border-rule-strong bg-white px-4 py-2 text-[0.88rem] font-bold transition-colors hover:border-ink"
            >
              <CountryFlag slug={c.slug} />
              {c.name}
            </Link>
          ))}
          <Link
            href="/horn"
            className="border border-rule-strong bg-white px-4 py-2 text-[0.88rem] font-bold transition-colors hover:border-ink"
          >
            Horn of Africa
          </Link>
        </div>

        <form action="/search" className="mx-auto mt-6 flex max-w-md">
          <label className="sr-only" htmlFor="nf-q">
            Search
          </label>
          <input
            id="nf-q"
            name="q"
            type="search"
            placeholder="Search Hornafrika…"
            className="flex-1 border border-rule-strong bg-white px-3.5 py-2.5 text-[0.92rem] outline-none"
          />
          <button
            type="submit"
            className="bg-brand px-5 text-[0.74rem] font-extrabold uppercase tracking-[0.08em] text-white hover:bg-brand-dark"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
