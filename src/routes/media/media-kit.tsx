import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, meta } from "@/components/site/Blocks";
import { Logo, Monogram } from "@/components/site/Logo";
const colours = [["Midnight Navy", "#0B1B44", "bg-navy"], ["Innovation Blue", "#0066FF", "bg-blue"], ["Premium Gold", "#D4AF37", "bg-gold"], ["Soft Blue Grey", "#DCE6F5", "bg-mist"]] as const;
export const Route = createFileRoute("/media/media-kit")({
  head: () => meta("Media Kit", "Future Media Summit logos, colours and typography for press and partners."),
  component: () => (
    <>
      <PageHero eyebrow="Media centre" title="Media kit" intro="Brand assets for press and partners. Please do not alter the logo." />
      <Section eyebrow="Logo" title="Our mark">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="surface-navy flex h-48 items-center justify-center rounded-lg"><Logo /></div>
          <div className="flex h-48 items-center justify-center rounded-lg border bg-card"><Logo light={false} /></div>
          <div className="surface-navy flex h-48 items-center justify-center rounded-lg"><Monogram className="h-20 w-20" /></div>
        </div>
      </Section>
      <Section tone="mist" eyebrow="Colour" title="Brand palette">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{colours.map(([n, h, c]) => (<div key={n} className="overflow-hidden rounded-lg border bg-card"><div className={`h-28 ${c}`} /><div className="p-5"><p className="font-display font-semibold">{n}</p><p className="font-mono text-sm text-muted-foreground">{h}</p></div></div>))}</div>
      </Section>
      <Section eyebrow="Typography" title="Montserrat & Inter">
        <p className="font-display text-5xl font-bold">Montserrat Bold</p><p className="mt-4 text-xl">Inter Regular — for readable body text.</p>
      </Section>
    </>
  ),
});
