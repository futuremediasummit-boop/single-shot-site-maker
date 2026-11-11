import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, meta } from "@/components/site/Blocks";
import { Logo, Monogram } from "@/components/site/Logo";
const colours = [["Midnight Plum", "#26184B", "bg-navy"], ["Hot Coral", "#EA1D3B", "bg-blue"], ["Sunny Yellow", "#FED835", "bg-gold"], ["Mint", "#6AECC4", "bg-mint"], ["Sky", "#7BD0F9", "bg-sky"], ["Lavender Haze", "#EFE6FF", "bg-mist"]] as const;
export const Route = createFileRoute("/media/media-kit")({
  head: () => meta("Media Kit", "Future Media Summit logos, colours and typography for press and partners."),
  component: () => (
    <>
      <PageHero eyebrow="Media centre" title="Media kit" intro="Brand assets for press and partners. Please do not alter the logo." />
      <Section eyebrow="Logo" title="Our mark">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="surface-navy flex h-48 items-center justify-center rounded-3xl"><Logo /></div>
          <div className="flex h-48 items-center justify-center rounded-3xl border bg-card"><Logo light={false} /></div>
          <div className="surface-navy flex h-48 items-center justify-center rounded-3xl"><Monogram className="h-20 w-20" /></div>
        </div>
      </Section>
      <Section tone="mint" eyebrow="Colour" title="Brand palette" intro="Hex codes are close matches to the on-screen colours.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{colours.map(([n, h, c]) => (<div key={n} className="reveal overflow-hidden rounded-3xl border bg-card shadow-card"><div className={`h-28 ${c}`} /><div className="p-5"><p className="font-display font-semibold">{n}</p><p className="font-mono text-sm text-muted-foreground">{h}</p></div></div>))}</div>
      </Section>
      <Section eyebrow="Typography" title="Bricolage Grotesque & DM Sans">
        <p className="font-display text-5xl font-extrabold">Bricolage Grotesque Bold</p><p className="mt-4 text-xl">DM Sans Regular, for easy-to-read body text.</p>
      </Section>
    </>
  ),
});
