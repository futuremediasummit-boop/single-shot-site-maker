import { createFileRoute, Link } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { editions } from "@/content/site";
export const Route = createFileRoute("/summits/")({
  head: () => meta("Summit Archives", "The digital archive of every Future Media Summit edition."),
  component: () => (
    <>
      <PageHero eyebrow="Summit archives" title="Every edition, preserved." intro="Themes, speakers, galleries, videos and reports from each annual summit." />
      <Section>
        {editions.length ? (
          <div className="divide-y border-y">{editions.map((e) => (<Link key={e.year} to="/summits/$year" params={{ year: String(e.year) }} className="grid gap-4 py-8 hover:bg-mist/40 sm:grid-cols-[160px_1fr]"><span className="font-display text-5xl font-bold text-navy">{e.year}</span><div><p className="eyebrow text-blue">{e.edition}</p><p className="mt-2 text-xl font-semibold">{e.theme}</p><p className="text-sm text-muted-foreground">{e.city}</p></div></Link>))}</div>
        ) : (<AwaitingContent title="No editions published yet" body="The archive will grow with each summit, starting with our first edition." />)}
      </Section>
    </>
  ),
});
