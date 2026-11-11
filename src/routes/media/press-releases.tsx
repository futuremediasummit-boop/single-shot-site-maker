import { createFileRoute } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { pressReleases } from "@/content/site";
export const Route = createFileRoute("/media/press-releases")({
  head: () => meta("Press Releases", "Official press releases from the Future Media Summit."),
  component: () => (
    <>
      <PageHero eyebrow="Media centre" title="Press releases" />
      <Section>{pressReleases.length ? (<ul className="divide-y border-y">{pressReleases.map((p) => (<li key={p.title} className="flex justify-between gap-6 py-6"><span className="font-display font-semibold">{p.title}</span><span className="text-sm text-muted-foreground">{p.date}</span></li>))}</ul>) : (<AwaitingContent title="No press releases yet" body="Official announcements will be published here." />)}</Section>
    </>
  ),
});
