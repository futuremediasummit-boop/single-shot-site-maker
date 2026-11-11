import { createFileRoute, Link } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { partners, sponsorshipTiers } from "@/content/site";
export const Route = createFileRoute("/sponsors")({
  head: () => meta("Sponsors", "Sponsorship opportunities and sponsors of the Future Media Summit."),
  component: () => {
    const list = partners.filter((p) => p.kind === "sponsor");
    return (
      <>
        <PageHero eyebrow="Sponsors" title="Put your brand at the centre of media’s future."><Button asChild variant="gold" size="xl"><Link to="/become-a-partner">Enquire about sponsorship</Link></Button></PageHero>
        <Section eyebrow="Sponsorship tiers" title="Opportunities">
          <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-3">{sponsorshipTiers.map((t, i) => (<div key={t} className="bg-card p-8"><span className={i === 0 ? "eyebrow text-gold" : "eyebrow text-blue"}>Tier {i + 1}</span><p className="mt-3 font-display text-lg font-semibold">{t}</p></div>))}</div>
        </Section>
        {!list.length && <Section tone="mist"><AwaitingContent title="Sponsors to be announced" body="Our sponsors will be recognised here." /></Section>}
      </>
    );
  },
});
