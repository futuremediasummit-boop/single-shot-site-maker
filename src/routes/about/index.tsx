import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, meta } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about/")({
  head: () => meta("About Us", "Who we are, why Future Media Summit exists and the themes that guide our work."),
  component: About,
});

const themes = ["Media innovation", "Professional development", "Collaboration", "Digital transformation", "Media entrepreneurship", "Knowledge exchange", "Industry leadership", "Emerging technologies"];

function About() {
  return (
    <>
      <PageHero eyebrow="About us" title="A permanent home for the media industry’s biggest questions." intro="Future Media Summit convenes the people building tomorrow’s media — before, during and long after each annual summit." />
      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div><p className="eyebrow text-blue">Mission</p><p className="mt-4 text-2xl font-display font-semibold">To be published by the summit office.</p><p className="mt-3 text-muted-foreground">Our official mission statement will appear here once approved.</p></div>
          <div><p className="eyebrow text-blue">Vision</p><p className="mt-4 text-2xl font-display font-semibold">To be published by the summit office.</p><p className="mt-3 text-muted-foreground">Our official vision statement will appear here once approved.</p></div>
        </div>
      </Section>
      <Section tone="mist" eyebrow="Editorial themes" title="What we explore" intro="Proposed areas of focus guiding our conversations.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{themes.map((t, i) => (<div key={t} className="rounded-lg border bg-card p-6"><span className="font-display text-sm font-bold text-gold">{String(i + 1).padStart(2, "0")}</span><p className="mt-3 font-display font-semibold">{t}</p></div>))}</div>
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
