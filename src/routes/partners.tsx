import { createFileRoute, Link } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { partners, partnershipCategories } from "@/content/site";
const tints = ["bg-mint/40", "bg-sky/40", "bg-gold/30", "bg-blue/15", "bg-mist"];

export const Route = createFileRoute("/partners")({
  head: () => meta("Partners", "The organisations partnering with Future Media Summit."),
  component: () => {
    const list = partners.filter((p) => p.kind === "partner");
    return (
      <>
        <PageHero eyebrow="Partners" title="Partners in shaping media’s future."><Button asChild variant="gold" size="xl"><Link to="/become-a-partner">Become a partner</Link></Button></PageHero>
        <Section eyebrow="Categories" title="Ways to partner">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{partnershipCategories.map((c, i) => (<div key={c} className={`reveal rounded-3xl p-6 transition hover:-translate-y-2 hover:rotate-1 ${tints[i % tints.length]}`}><p className="font-display font-semibold">{c}</p><p className="mt-2 text-sm text-muted-foreground">{list.filter((p) => p.category === c).length ? list.filter((p) => p.category === c).map((p) => p.name).join(", ") : "Open for partnership"}</p></div>))}</div>
        </Section>
        {!list.length && <Section tone="sky"><AwaitingContent title="Partner line-up coming soon" body="We’ll show off our partners here as they join." /></Section>}
      </>
    );
  },
});
