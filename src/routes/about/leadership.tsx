import { createFileRoute } from "@tanstack/react-router";
import { AwaitingContent, PageHero, PhotoTile, Section, meta } from "@/components/site/Blocks";
import { leadership } from "@/content/site";
export const Route = createFileRoute("/about/leadership")({
  head: () => meta("Leadership", "The people leading Future Media Summit."),
  component: () => (
    <>
      <PageHero eyebrow="Leadership" title="The people behind the summit." />
      <Section>
        {leadership.length ? (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">{leadership.map((l, i) => (<div key={l.name}><PhotoTile src={l.photo} name={l.name} i={i} /><p className="mt-4 font-display text-lg font-semibold">{l.name}</p><p className="text-sm text-blue">{l.title}</p><p className="mt-3 text-sm text-muted-foreground">{l.bio}</p></div>))}</div>
        ) : (<AwaitingContent title="Meet the team soon" body="Profiles of the people behind the summit are on their way." />)}
      </Section>
    </>
  ),
});
