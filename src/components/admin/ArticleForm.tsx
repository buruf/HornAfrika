"use client";
import { CountryFlag } from "@/components/CountryFlag";

import { useState } from "react";
import Link from "next/link";
import { saveArticle } from "@/app/admin/articles/actions";

export type FormOptions = {
  countries: { id: string; slug: string; name: string; flag: string }[];
  regions: { id: string; slug: string; name: string; countryId: string }[];
  categories: { id: string; slug: string; name: string }[];
  subcategories: { id: string; name: string; categoryId: string }[];
  authors: { id: string; name: string }[];
  topics: { id: string; name: string }[];
};

export type ArticleValues = {
  id?: string;
  headline: string;
  slug: string;
  deck: string;
  body: string;
  countryId: string;
  regionId: string;
  categoryId: string;
  subcategoryId: string;
  authorId: string;
  placement: string;
  isBreaking: boolean;
  isDeveloping: boolean;
  imageSeed: string;
  imageUrl: string;
  imageCaption: string;
  imageCredit: string;
  sourceNote: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  countryIds: string[];
  topicIds: string[];
};

type Props = {
  values: ArticleValues;
  options: FormOptions;
  canEditAny: boolean;
  canManageHomepage: boolean;
};

const label =
  "block text-[0.68rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute";
const field =
  "mt-1.5 w-full border border-rule-strong bg-white px-3 py-2 text-[0.9rem] outline-none focus:border-ink";

export function ArticleForm({ values, options, canEditAny, canManageHomepage }: Props) {
  const [countryId, setCountryId] = useState(values.countryId);
  const [categoryId, setCategoryId] = useState(values.categoryId);
  const [headline, setHeadline] = useState(values.headline);
  const [body, setBody] = useState(values.body);
  const [seoTitle, setSeoTitle] = useState(values.seoTitle);
  const [seoDescription, setSeoDescription] = useState(values.seoDescription);
  const [extraCountries, setExtraCountries] = useState<string[]>(values.countryIds);
  const [topics, setTopics] = useState<string[]>(values.topicIds);

  const regions = options.regions.filter((r) => r.countryId === countryId);
  const subcats = options.subcategories.filter((s) => s.categoryId === categoryId);

  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  const previewSlug =
    values.slug ||
    headline
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 90);
  const countrySlug =
    options.countries.find((c) => c.id === countryId)?.slug ?? "horn";
  const categorySlug =
    options.categories.find((c) => c.id === categoryId)?.slug ?? "news";

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  return (
    <form action={saveArticle} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {extraCountries.map((id) => (
        <input key={id} type="hidden" name="countries" value={id} />
      ))}
      {topics.map((id) => (
        <input key={id} type="hidden" name="topics" value={id} />
      ))}

      {/* ---------------------------------------------------------- main */}
      <div className="space-y-5">
        <div className="border border-rule bg-white p-5">
          <label className={label} htmlFor="headline">
            Headline
          </label>
          <input
            id="headline"
            name="headline"
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className={`${field} text-[1.15rem] font-extrabold`}
          />

          <div className="mt-4">
            <label className={label} htmlFor="deck">
              Summary / deck
            </label>
            <textarea
              id="deck"
              name="deck"
              rows={2}
              defaultValue={values.deck}
              className={field}
            />
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-3">
              <label className={label} htmlFor="body">
                Body
              </label>
              <span className="text-[0.72rem] text-ink-mute">
                {words} words · ~{Math.max(1, Math.round(words / 200))} min read
              </span>
              <span className="ml-auto text-[0.7rem] text-ink-mute">
                Blank line = new paragraph · **bold** · *italic* · [Editor: …] renders as a note
              </span>
            </div>
            <textarea
              id="body"
              name="body"
              required
              rows={26}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`${field} font-[inherit] leading-[1.7]`}
            />
          </div>
        </div>

        {/* --------------------------------------------------------- image */}
        <div className="border border-rule bg-white p-5">
          <h2 className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em]">Image</h2>
          <p className="mt-1 text-[0.78rem] text-ink-mute">
            Leave the URL empty to use the generated editorial graphic. Adding a real
            photograph replaces it everywhere.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="imageUrl">
                Photograph URL
              </label>
              <input id="imageUrl" name="imageUrl" defaultValue={values.imageUrl} className={field} />
            </div>
            <div>
              <label className={label} htmlFor="imageSeed">
                Graphic seed
              </label>
              <input
                id="imageSeed"
                name="imageSeed"
                defaultValue={values.imageSeed}
                placeholder="defaults to the slug"
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="imageCaption">
                Caption
              </label>
              <input
                id="imageCaption"
                name="imageCaption"
                defaultValue={values.imageCaption}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="imageCredit">
                Credit
              </label>
              <input
                id="imageCredit"
                name="imageCredit"
                defaultValue={values.imageCredit}
                className={field}
              />
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------- sourcing */}
        <div className="border border-rule bg-white p-5">
          <h2 className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em]">
            Sourcing &amp; labels
          </h2>
          <div className="mt-3">
            <label className={label} htmlFor="sourceNote">
              Sourcing note (shown to readers above the body)
            </label>
            <textarea
              id="sourceNote"
              name="sourceNote"
              rows={2}
              defaultValue={values.sourceNote}
              placeholder="e.g. Based on official statements. Not independently verified."
              className={field}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-[0.86rem]">
              <input
                type="checkbox"
                name="isDeveloping"
                defaultChecked={values.isDeveloping}
                className="h-4 w-4 accent-[#8a5a00]"
              />
              Developing story
            </label>
            {canEditAny && (
              <label className="flex items-center gap-2 text-[0.86rem]">
                <input
                  type="checkbox"
                  name="isBreaking"
                  defaultChecked={values.isBreaking}
                  className="h-4 w-4 accent-[#c9182b]"
                />
                Breaking news (appears in the ticker)
              </label>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------ SEO */}
        <div className="border border-rule bg-white p-5">
          <h2 className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em]">SEO</h2>

          <div className="mt-3 border border-rule bg-shell p-3">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.09em] text-ink-mute">
              Search preview
            </p>
            <p className="mt-1.5 truncate text-[0.78rem] text-[#1b6b1b]">
              hornafrika.com/{countrySlug}/{categorySlug}/{previewSlug || "…"}
            </p>
            <p className="truncate text-[1rem] font-semibold text-[#1a0dab]">
              {seoTitle || headline || "Headline"} | HORNAFRIKA
            </p>
            <p className="clamp-2 text-[0.82rem] text-ink-soft">
              {seoDescription || values.deck || "Add a summary to control this text."}
            </p>
          </div>

          <div className="mt-4 grid gap-4">
            <div>
              <label className={label} htmlFor="slug">
                URL slug
              </label>
              <input id="slug" name="slug" defaultValue={values.slug} className={field} />
            </div>
            <div>
              <label className={label} htmlFor="seoTitle">
                SEO title{" "}
                <span className="font-normal normal-case tracking-normal">
                  ({seoTitle.length}/60)
                </span>
              </label>
              <input
                id="seoTitle"
                name="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="seoDescription">
                Meta description{" "}
                <span className="font-normal normal-case tracking-normal">
                  ({seoDescription.length}/160)
                </span>
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="canonicalUrl">
                Canonical URL (only if this was published elsewhere first)
              </label>
              <input
                id="canonicalUrl"
                name="canonicalUrl"
                defaultValue={values.canonicalUrl}
                className={field}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- sidebar */}
      <div className="space-y-5">
        <div className="sticky top-4 space-y-5">
          <div className="border border-rule bg-white p-4">
            <button
              type="submit"
              className="w-full bg-brand py-2.5 text-[0.76rem] font-extrabold uppercase tracking-[0.09em] text-white transition-colors hover:bg-brand-dark"
            >
              Save article
            </button>
            {values.id && (
              <Link
                href={`/${countrySlug}/${categorySlug}/${values.slug}`}
                target="_blank"
                className="mt-2 block text-center text-[0.76rem] font-bold text-ink-soft hover:text-brand"
              >
                Preview on site ↗
              </Link>
            )}
          </div>

          <div className="border border-rule bg-white p-4">
            <h2 className="text-[0.72rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute">
              Placement
            </h2>

            <div className="mt-3">
              <label className={label} htmlFor="countryId">
                Primary country
              </label>
              <select
                id="countryId"
                name="countryId"
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className={field}
              >
                <option value="">Horn of Africa (no single country)</option>
                {options.countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    <CountryFlag slug={c.slug} /> {c.name}
                  </option>
                ))}
              </select>
            </div>

            {regions.length > 0 && (
              <div className="mt-3">
                <label className={label} htmlFor="regionId">
                  Region
                </label>
                <select
                  id="regionId"
                  name="regionId"
                  defaultValue={values.regionId}
                  className={field}
                >
                  <option value="">No specific region</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-3">
              <label className={label} htmlFor="categoryId">
                Section
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={field}
              >
                {options.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {subcats.length > 0 && (
              <div className="mt-3">
                <label className={label} htmlFor="subcategoryId">
                  Subsection
                </label>
                <select
                  id="subcategoryId"
                  name="subcategoryId"
                  defaultValue={values.subcategoryId}
                  className={field}
                >
                  <option value="">None</option>
                  {subcats.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {canEditAny && (
              <div className="mt-3">
                <label className={label} htmlFor="authorId">
                  Author
                </label>
                <select
                  id="authorId"
                  name="authorId"
                  defaultValue={values.authorId}
                  className={field}
                >
                  {options.authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {canManageHomepage && (
              <div className="mt-3">
                <label className={label} htmlFor="placement">
                  Homepage placement
                </label>
                <select
                  id="placement"
                  name="placement"
                  defaultValue={values.placement}
                  className={field}
                >
                  <option value="NONE">None</option>
                  <option value="LEAD">Lead story</option>
                  <option value="SECONDARY">Secondary</option>
                  <option value="COUNTRY_LEAD">Country lead</option>
                  <option value="SECTION_FEATURE">Section feature</option>
                </select>
                <p className="mt-1.5 text-[0.72rem] text-ink-mute">
                  Assigning slots directly is done on the{" "}
                  <Link href="/admin/homepage" className="font-semibold text-brand underline">
                    homepage page
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>

          {/* ------------------------------------------- multi-country tags */}
          <div className="border border-rule bg-white p-4">
            <h2 className="text-[0.72rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute">
              Also about
            </h2>
            <p className="mt-1 text-[0.74rem] leading-relaxed text-ink-mute">
              Tag every country the story involves. Two or more makes it a Horn of Africa
              regional story.
            </p>
            <div className="mt-2.5 space-y-1.5">
              {options.countries.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-[0.85rem]">
                  <input
                    type="checkbox"
                    checked={extraCountries.includes(c.id) || countryId === c.id}
                    disabled={countryId === c.id}
                    onChange={() => toggle(extraCountries, setExtraCountries, c.id)}
                    className="h-4 w-4 accent-[#0b1f33]"
                  />
                  <CountryFlag slug={c.slug} /> {c.name}
                  {countryId === c.id && (
                    <span className="text-[0.7rem] text-ink-mute">(primary)</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="border border-rule bg-white p-4">
            <h2 className="text-[0.72rem] font-extrabold uppercase tracking-[0.11em] text-ink-mute">
              Topics
            </h2>
            <div className="mt-2.5 flex max-h-56 flex-wrap gap-1.5 overflow-y-auto">
              {options.topics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggle(topics, setTopics, t.id)}
                  className={`border px-2 py-1 text-[0.74rem] font-semibold transition-colors ${
                    topics.includes(t.id)
                      ? "border-ink bg-ink text-white"
                      : "border-rule-strong text-ink-soft hover:border-ink"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
