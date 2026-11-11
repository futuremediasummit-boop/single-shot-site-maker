import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";
import { AwaitingContent, DraftBadge, PageHero, Section, meta } from "@/components/site/Blocks";
import { editions } from "@/content/site";

export const Route = createFileRoute("/summits/$year")({
  loader: ({ params }) => { const e = editions.find((x) => String(x.year) === params.year); if (!e) throw notFound(); return e; },
  head: ({ loaderData }) => loaderData ? meta(`${loaderData.year} Summit`, loaderData.theme) : { meta: [{ title: "Edition unavailable | Future Media Summit" }, { name: "robots", content: "noindex" }] },
  component: Edition,
});

const tiles = ["bg-mint", "bg-sky", "bg-gold", "bg-blue/70", "bg-mist", "bg-mint/60"];

function Edition() {
  const e = Route.useLoaderData();
  const idx = editions.findIndex((x) => x.year === e.year);
  const other = editions[idx + 1] ?? editions[idx - 1];
  return (
    <>
      <PageHero eyebrow={`${e.edition} · ${e.year}`} title={e.theme} intro={e.summary}>
        <div className="flex flex-wrap items-center gap-4 text-sm text-navy-foreground/80">
          {e.draft && <DraftBadge />}
          <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />{e.dateLabel}</span>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />{e.venue}, {e.city}</span>
        </div>
      </PageHero>

      {e.stats && (
        <Section tone="sun" className="!py-12">
          <div className="grid grid-cols-3 gap-6 text-center">
            {e.stats.map((s) => (<div key={s.label}><div className="font-display text-4xl font-extrabold text-navy sm:text-6xl">{s.value}</div><div className="eyebrow mt-1 text-navy/70">{s.label}</div></div>))}
          </div>
        </Section>
      )}

      <Section eyebrow="Highlights" title="What happened">
        {e.highlights?.length ? (
          <ul className="grid gap-4 sm:grid-cols-2">{e.highlights.map((h) => (<li key={h} className="reveal rounded-2xl border bg-card p-6 font-medium shadow-card">{h}</li>))}</ul>
        ) : (<AwaitingContent title="Highlights coming soon" body="Talks, moments and takeaways will be added here." />)}
      </Section>

      <Section tone="mint" eyebrow="Gallery" title="Photos from the day" intro={e.draft ? "Placeholder tiles: real photos go here once the organisers share them." : undefined}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {tiles.map((t, i) => (<div key={i} className={`reveal aspect-[4/3] rounded-3xl ${t} transition hover:scale-[1.03] hover:-rotate-1`} />))}
        </div>
      </Section>

      {other && (
        <Section>
          <Link to="/summits/$year" params={{ year: String(other.year) }} className="group flex items-center justify-between rounded-3xl bg-navy p-8 text-navy-foreground transition hover:-translate-y-1">
            <div><p className="eyebrow text-gold">Also see</p><p className="font-display text-3xl font-bold">{other.year} · {other.edition}</p></div>
            <span className="text-3xl transition group-hover:translate-x-2">→</span>
          </Link>
        </Section>
      )}
    </>
  );
}
