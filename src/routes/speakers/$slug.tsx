import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero, Section, meta } from "@/components/site/Blocks";
import { speakers } from "@/content/site";
export const Route = createFileRoute("/speakers/$slug")({
  loader: ({ params }) => { const s = speakers.find((x) => x.slug === params.slug); if (!s) throw notFound(); return s; },
  head: ({ loaderData }) => loaderData ? meta(loaderData.name, `${loaderData.title}, ${loaderData.organisation}`) : { meta: [{ title: "Speaker unavailable | Future Media Summit" }, { name: "robots", content: "noindex" }] },
  component: () => { const s = Route.useLoaderData(); return (<><PageHero eyebrow={s.role} title={s.name} intro={`${s.title}, ${s.organisation}`} /><Section><p className="max-w-3xl text-lg">{s.bio}</p></Section></>); },
});
