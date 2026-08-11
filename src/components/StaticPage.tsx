import { Breadcrumbs, PageHeader } from "@/components/PageHeader";

export function StaticPage({
  title,
  eyebrow,
  blurb,
  children,
}: {
  title: string;
  eyebrow?: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
      <PageHeader eyebrow={eyebrow} title={title} blurb={blurb} />
      <div className="mt-7 max-w-[46rem] space-y-5 text-[1rem] leading-[1.75] text-[#17293a]">
        {children}
      </div>
    </>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="!mt-9 border-b border-rule pb-1.5 text-[1.15rem] font-extrabold">
      {children}
    </h2>
  );
}
