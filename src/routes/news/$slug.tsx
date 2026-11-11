import { createFileRoute, notFound } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PageHero, Section, meta } from "@/components/site/Blocks";
import { articles } from "@/content/site";
export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }) => { const a = articles.find((x) => x.slug === params.slug); if (!a) throw notFound(); return a; },
  head: ({ loaderData }) => loaderData ? meta(loaderData.title, loaderData.excerpt) : { meta: [{ title: "Article unavailable | Future Media Summit" }, { name: "robots", content: "noindex" }] },
  component: () => { const a = Route.useLoaderData(); return (<><PageHero eyebrow={`${a.category} · ${a.date}`} title={a.title} intro={a.excerpt} /><Section><article className="mx-auto max-w-3xl space-y-6 text-lg leading-relaxed">{a.body.map((p, i) => <p key={i}>{p}</p>)}<Link to="/news" className="inline-block text-base font-bold text-blue hover:underline">← Back to news</Link></article></Section></>); },
});
