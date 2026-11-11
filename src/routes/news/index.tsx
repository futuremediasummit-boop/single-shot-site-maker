import { createFileRoute, Link } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { articles } from "@/content/site";
export const Route = createFileRoute("/news/")({
  head: () => meta("News & Insights", "Announcements, interviews and analysis on the future of media."),
  component: () => (
    <>
      <PageHero eyebrow="News & insights" title="Reporting on the future of media." />
      <Section>{articles.length ? (<div className="grid gap-10 md:grid-cols-3">{articles.map((a) => (<Link key={a.slug} to="/news/$slug" params={{ slug: a.slug }} className="reveal group rounded-3xl border bg-card p-6 shadow-card transition hover:-translate-y-2"><p className="eyebrow text-blue">{a.category} · {a.date}</p><h3 className="mt-3 text-xl font-semibold group-hover:text-blue">{a.title}</h3><p className="mt-3 text-sm text-muted-foreground">{a.excerpt}</p></Link>))}</div>) : (<AwaitingContent title="The newsroom opens soon" body="Stories, interviews and announcements will land here." />)}</Section>
    </>
  ),
});
