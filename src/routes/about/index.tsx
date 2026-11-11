import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, meta, pops } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about/")({
  head: () => meta("About Us", "Who we are, why Future Media Summit exists and the themes that guide our work."),
  component: About,
});

const themes = ["Media innovation", "Professional development", "Collaboration", "Digital transformation", "Media entrepreneurship", "Knowledge exchange", "Industry leadership", "Emerging technologies"];

function About() {
  return (
    <>
      <PageHero eyebrow="About us" title="We’re all about the future of media." intro="Future Media Summit brings media lovers together — at our yearly summit and all year round." />
      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="reveal rounded-3xl bg-mint/40 p-8"><p className="eyebrow text-blue">Our mission</p><p className="mt-4 font-display text-2xl font-semibold">Coming soon: what we’re here to do.</p><p className="mt-3 text-muted-foreground">We’re putting the finishing touches on our mission. Check back soon!</p></div>
          <div className="reveal rounded-3xl bg-sky/40 p-8"><p className="eyebrow text-blue">Our vision</p><p className="mt-4 font-display text-2xl font-semibold">Coming soon: where we’re headed.</p><p className="mt-3 text-muted-foreground">Our vision for the future of media is on its way.</p></div>
        </div>
      </Section>
      <Section tone="sun" eyebrow="What we explore" title="Topics we love" intro="The big ideas we keep coming back to.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{themes.map((t, i) => (<div key={t} className="reveal rounded-3xl border bg-card p-6 shadow-card transition hover:-translate-y-2 hover:rotate-1"><span className={`inline-flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-bold text-navy ${pops[i % pops.length]}`}>{String(i + 1).padStart(2, "0")}</span><p className="mt-3 font-display font-semibold">{t}</p></div>))}</div>
      </Section>
      <Section>
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="navy" size="xl"><Link to="/about/our-story">Our story</Link></Button>
          <Button asChild variant="outline" size="xl"><Link to="/about/leadership">Leadership</Link></Button>
        </div>
      </Section>
    </>
  );
}
