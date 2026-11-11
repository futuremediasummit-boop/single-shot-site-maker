import { createFileRoute } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { leadership } from "@/content/site";
export const Route = createFileRoute("/about/leadership")({
  head: () => meta("Leadership", "The people leading Future Media Summit."),
  component: () => (
    <>
      <PageHero eyebrow="Leadership" title="The people behind the summit." />
      <Section>
        {leadership.length ? (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">{leadership.map((l) => (<div key={l.name}><div className="aspect-[4/5] rounded-lg bg-mist">{l.photo && <img src={l.photo} alt={l.name} className="h-full w-full rounded-lg object-cover" />}</div><p className="mt-4 font-display text-lg font-semibold">{l.name}</p><p className="text-sm text-blue">{l.title}</p><p className="mt-3 text-sm text-muted-foreground">{l.bio}</p></div>))}</div>
        ) : (<AwaitingContent title="Leadership profiles coming soon" body="Official profiles of our leadership team will be published here." />)}
      </Section>
    </>
  ),
});
