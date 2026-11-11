import { createFileRoute, Link } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { speakers } from "@/content/site";
export const Route = createFileRoute("/speakers/")({
  head: () => meta("Speakers", "Keynotes, panellists and moderators of the Future Media Summit."),
  component: () => (
    <>
      <PageHero eyebrow="Speakers" title="The voices shaping the conversation." />
      <Section>
        {speakers.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{speakers.map((s) => (<Link key={s.slug} to="/speakers/$slug" params={{ slug: s.slug }}><div className="aspect-[4/5] rounded-lg bg-mist">{s.photo && <img src={s.photo} alt={s.name} className="h-full w-full rounded-lg object-cover" />}</div><p className="mt-4 font-display font-semibold">{s.name}</p><p className="text-sm text-muted-foreground">{s.title}, {s.organisation}</p></Link>))}</div>
        ) : (<AwaitingContent title="Speakers to be announced" body="Confirmed speakers will be revealed here as the programme takes shape." />)}
      </Section>
    </>
  ),
});
