import { createFileRoute } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { pressReleases } from "@/content/site";
export const Route = createFileRoute("/media/press-releases")({
  head: () => meta("Press Releases", "Official press releases from the Future Media Summit."),
  component: () => (
    <>
      <PageHero eyebrow="Media centre" title="Press releases" />
      <Section>{pressReleases.length ? (<ul className="space-y-4">{pressReleases.map((p) => (<li key={p.title} className="reveal flex flex-wrap justify-between gap-3 rounded-3xl border bg-card p-6 shadow-card transition hover:-translate-y-1"><span className="font-display font-semibold">{p.title}</span><span className="text-sm text-muted-foreground">{p.date}</span></li>))}</ul>) : (<AwaitingContent title="No press releases yet" body="Announcements from the summit team will show up here." />)}</Section>
    </>
  ),
});
