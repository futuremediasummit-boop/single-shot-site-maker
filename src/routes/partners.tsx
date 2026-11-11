import { createFileRoute, Link } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { partners, partnershipCategories } from "@/content/site";
export const Route = createFileRoute("/partners")({
  head: () => meta("Partners", "The organisations partnering with Future Media Summit."),
  component: () => {
    const list = partners.filter((p) => p.kind === "partner");
    return (
      <>
        <PageHero eyebrow="Partners" title="Partners in shaping media’s future."><Button asChild variant="gold" size="xl"><Link to="/become-a-partner">Become a partner</Link></Button></PageHero>
        <Section eyebrow="Categories" title="Ways to partner">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{partnershipCategories.map((c) => (<div key={c} className="rounded-lg border bg-card p-6"><p className="font-display font-semibold">{c}</p><p className="mt-2 text-sm text-muted-foreground">{list.filter((p) => p.category === c).length ? list.filter((p) => p.category === c).map((p) => p.name).join(", ") : "Open for partnership"}</p></div>))}</div>
        </Section>
        {!list.length && <Section tone="mist"><AwaitingContent title="Partner roster coming soon" body="Confirmed partner organisations will be featured here." /></Section>}
      </>
    );
  },
});
