import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AwaitingContent, DraftBadge, PageHero, Section, meta } from "@/components/site/Blocks";
import { editions } from "@/content/site";

export const Route = createFileRoute("/summits/")({
  head: () => meta("Summit Archives", "Every Future Media Summit edition, all in one place."),
  component: () => (
    <>
      <PageHero eyebrow="Summit archives" title="Every edition, all in one place." intro="Themes, speakers, photos and highlights from each year of the summit." />
      <Section>
        {editions.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {editions.map((e, i) => (
              <Link key={e.year} to="/summits/$year" params={{ year: String(e.year) }} className="reveal group relative overflow-hidden rounded-3xl border bg-card p-8 shadow-card transition hover:-translate-y-2 hover:rotate-1">
                <div className={`blob -right-10 -top-10 h-40 w-40 opacity-50 ${i % 2 ? "bg-sky" : "bg-mint"}`} />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-display text-7xl font-extrabold text-navy">{e.year}</span>
                    {e.draft && <DraftBadge />}
                  </div>
                  <p className="eyebrow mt-4 text-blue">{e.edition}</p>
                  <p className="mt-2 text-xl font-semibold">{e.theme}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{e.dateLabel} · {e.venue}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue">Open edition <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        ) : (<AwaitingContent title="No editions published yet" body="The archive will grow with each summit, starting with our first edition." />)}
      </Section>
    </>
  ),
});
