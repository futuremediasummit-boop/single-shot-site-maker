import { createFileRoute, Link } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { focusAreas, upcomingSummit } from "@/content/site";

export const Route = createFileRoute("/summit")({
  head: () => meta("The Summit", "What the Future Media Summit represents, who it is for and the industry conversations it convenes."),
  component: Summit,
});

const audience = ["Journalists & editors", "Broadcasters", "Content creators", "Technology innovators", "Policymakers & regulators", "Investors & businesses", "Academic institutions", "Emerging media leaders"];

function Summit() {
  return (
    <>
      <PageHero eyebrow="The summit" title="Where media’s next chapter takes shape." intro="An annual gathering of the professionals, institutions and innovators transforming how stories are told, funded and shared.">
        <div className="flex flex-wrap gap-4"><Button asChild variant="gold" size="xl"><Link to="/tickets">Get tickets</Link></Button><Button asChild variant="onDark" size="xl"><Link to="/become-a-partner">Partner with us</Link></Button></div>
      </PageHero>
      <Section eyebrow="Focus areas" title="Areas of discussion">
        <div className="flex flex-wrap gap-3">{focusAreas.map((f) => (<span key={f} className="rounded-full border border-input bg-card px-5 py-2.5 text-sm font-medium">{f}</span>))}</div>
      </Section>
      <Section tone="navy" eyebrow="Who attends" title="Built for the whole media ecosystem">
        <div className="grid gap-px overflow-hidden rounded-lg bg-navy-foreground/10 sm:grid-cols-2 lg:grid-cols-4">{audience.map((a) => (<div key={a} className="surface-navy p-8 font-display font-semibold">{a}</div>))}</div>
      </Section>
      <Section eyebrow="Programme" title="Sessions, keynotes & workshops">
        <AwaitingContent title={upcomingSummit ? "Programme to be announced" : "Programme publishes with the next edition"} body="Keynotes, panels, workshops, networking sessions and exhibitions will be listed here with times, venues and speakers." />
      </Section>
    </>
  );
}
