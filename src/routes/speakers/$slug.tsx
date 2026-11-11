import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PageHero, PhotoTile, Section, meta } from "@/components/site/Blocks";
import { speakers } from "@/content/site";
export const Route = createFileRoute("/speakers/$slug")({
  loader: ({ params }) => { const s = speakers.find((x) => x.slug === params.slug); if (!s) throw notFound(); return s; },
  head: ({ loaderData }) => loaderData ? meta(loaderData.name, `${loaderData.title}, ${loaderData.organisation}`) : { meta: [{ title: "Speaker unavailable | Future Media Summit" }, { name: "robots", content: "noindex" }] },
  component: () => { const s = Route.useLoaderData(); return (<><PageHero eyebrow={s.role} title={s.name} intro={`${s.title}, ${s.organisation}`} /><Section><div className="grid items-start gap-10 md:grid-cols-[280px_1fr]"><PhotoTile src={s.photo} name={s.name} i={0} /><div><p className="max-w-3xl text-lg">{s.bio}</p><Link to="/speakers" className="mt-8 inline-block font-bold text-blue hover:underline">← All speakers</Link></div></div></Section></>); },
});
