import fs from "node:fs";
const p = "src/app/(site)/page.tsx";
let s = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const swap = (a, b, l) => { if (!s.includes(a)) { console.error("MISS", l); process.exit(1); } s = s.replace(a, b); };

// --- hero slide 1 + the three secondaries -------------------------------
swap(
`            lead ? <HeroCard key="lead" article={lead} fill /> : null,`,
`            lead && isFresh(lead.publishedAt) ? (
              <HeroCard key="lead" article={lead} fill />
            ) : null,`,
  "hero lead");

swap(
`          {secondaries.map((a) => (
            <OverlayCard key={a.id} article={a} fill />
          ))}`,
`          {fill(secondaries, 3).map((slot) =>
            slot.kind === "article" ? (
              <OverlayCard key={slot.item.id} article={slot.item} fill />
            ) : (
              <WireOverlayCard key={slot.item.id} item={slot.item} fill />
            ),
          )}`,
  "secondaries");

// --- country blocks: the bullet list under each flag ---------------------
swap(
`                {(cLead || rest.length > 0) && (
                  <ul className="space-y-2 px-3 py-3">
                    {cLead && <BulletItem article={cLead} />}
                    {rest.map((a) => (
                      <BulletItem key={a.id} article={a} />
                    ))}
                  </ul>
                )}`,
`                {/* Falls back to that country's own wire, so a quiet desk
                    still shows what is happening there today. */}
                <ul className="space-y-2 px-3 py-3">
                  {fill(
                    [cLead, ...rest].filter(Boolean) as typeof rest,
                    4,
                  ).map((slot) =>
                    slot.kind === "article" ? (
                      <BulletItem key={slot.item.id} article={slot.item} />
                    ) : (
                      <WireBulletItem key={slot.item.id} item={slot.item} />
                    ),
                  )}
                </ul>`,
  "country bullets");

// --- Horn of Africa -------------------------------------------------------
swap(
`            {horn.length > 0 && (
              <div className="grid gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                <StackedCard article={horn[0]} imageHeight="h-[236px]" />
                <div className="space-y-4">
                  {horn.slice(1, 5).map((a) => (
                    <RowCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            )}`,
`            {(() => {
              const slots = fill(horn, 5);
              if (slots.length === 0) return null;
              const [first, ...others] = slots;
              return (
                <div className="grid gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                  {first.kind === "article" ? (
                    <StackedCard article={first.item} imageHeight="h-[236px]" />
                  ) : (
                    <WireStackedCard item={first.item} imageHeight="h-[236px]" />
                  )}
                  <div className="space-y-4">
                    {others.map((slot) =>
                      slot.kind === "article" ? (
                        <RowCard key={slot.item.id} article={slot.item} />
                      ) : (
                        <WireRowCard key={slot.item.id} item={slot.item} />
                      ),
                    )}
                  </div>
                </div>
              );
            })()}`,
  "horn regional");

fs.writeFileSync(p, s, "utf8");
console.log("hero, secondaries, country blocks and Horn wired");
