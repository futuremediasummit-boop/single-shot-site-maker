import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, meta, pops } from "@/components/site/Blocks";
export const Route = createFileRoute("/media/")({
  head: () => meta("Media Centre", "Press releases, media accreditation and the official Future Media Summit media kit."),
  component: () => (
    <>
      <PageHero eyebrow="Media centre" title="Resources for the press." intro="Accreditation, official announcements and brand assets for journalists covering the summit." />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {([["/media/accreditation", "Accreditation", "Apply for media access to the summit."], ["/media/press-releases", "Press releases", "Official announcements from the summit office."], ["/media/media-kit", "Media kit", "Logos, brand guidelines and fact sheets."]] as const).map(([to, t, d], i) => (
            <Link key={to} to={to} className="reveal group rounded-3xl border bg-card p-8 shadow-card transition hover:-translate-y-2 hover:rotate-1"><span className={`block h-3 w-14 rounded-full ${pops[i % pops.length]}`} /><h3 className="mt-6 text-xl font-semibold group-hover:text-blue">{t}</h3><p className="mt-2 text-muted-foreground">{d}</p></Link>
          ))}
        </div>
      </Section>
    </>
  ),
});
