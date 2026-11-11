import { createFileRoute, notFound } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { editions } from "@/content/site";
export const Route = createFileRoute("/summits/$year")({
  loader: ({ params }) => { const e = editions.find((x) => String(x.year) === params.year); if (!e) throw notFound(); return e; },
  head: ({ loaderData }) => loaderData ? meta(`${loaderData.year} Summit`, loaderData.theme) : { meta: [{ title: "Edition unavailable | Future Media Summit" }, { name: "robots", content: "noindex" }] },
  component: Edition,
});
function Edition() {
  const e = Route.useLoaderData();
  return (<><PageHero eyebrow={`${e.edition} · ${e.year}`} title={e.theme} intro={`${e.dateLabel} · ${e.venue}, ${e.city}`} /><Section>{e.summary ? <p className="max-w-3xl text-lg">{e.summary}</p> : <AwaitingContent title="Edition report coming soon" body="Highlights, galleries and resources for this edition will be added here." />}</Section></>);
}
