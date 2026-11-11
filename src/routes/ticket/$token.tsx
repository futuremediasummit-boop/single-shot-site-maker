import { createFileRoute } from "@tanstack/react-router";
import { AwaitingContent, DraftBadge, PageHero, Section } from "@/components/site/Blocks";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/ticket/$token")({
  head: () => ({ meta: [{ title: "Your ticket | Future Media Summit" }, { name: "robots", content: "noindex" }] }),
  component: Ticket,
});

/** Decorative placeholder pattern, NOT a scannable QR code. Real QR codes arrive with ticketing (roadmap phase 4). */
function FakeQr() {
  const cells = Array.from({ length: 169 }, (_, i) => ((i * 7 + (i >> 3) * 5) % 3 === 0));
  return (
    <svg viewBox="0 0 13 13" className="h-40 w-40 rounded-xl bg-white p-2" aria-label="Placeholder QR code">
      {cells.map((on, i) => on && <rect key={i} x={i % 13} y={Math.floor(i / 13)} width="1" height="1" className="fill-navy" />)}
      {[[0, 0], [10, 0], [0, 10]].map(([x, y]) => (<g key={`${x}${y}`}><rect x={x} y={y} width="3" height="3" className="fill-navy" /><rect x={x + 0.7} y={y + 0.7} width="1.6" height="1.6" fill="white" /></g>))}
    </svg>
  );
}

function Ticket() {
  const { token } = Route.useParams();
  if (token !== "demo") {
    return (<><PageHero eyebrow="Digital ticket" title="Ticket lookup" /><Section><AwaitingContent title="Ticket not found" body="This ticket link is invalid or hasn’t been issued. Check the link in your confirmation email." action={{ to: "/contact", label: "Contact the summit office" }} /></Section></>);
  }
  return (
    <>
      <PageHero eyebrow="Digital ticket" title="Here’s what your ticket looks like" intro="Sample only. Real tickets will carry your name and a scannable QR code for check-in." />
      <Section tone="sun">
        <div className="animate-pop mx-auto flex max-w-2xl overflow-hidden rounded-3xl bg-navy text-navy-foreground shadow-card">
          <div className="flex-1 p-8">
            <Logo />
            <div className="mt-8"><DraftBadge>Sample ticket</DraftBadge></div>
            <p className="mt-4 font-display text-3xl font-extrabold">Your Name Here</p>
            <p className="eyebrow mt-1 text-gold">Standard Delegate</p>
            <p className="mt-6 text-sm text-navy-foreground/70">Date and venue to be confirmed</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 border-l-2 border-dashed border-navy-foreground/30 bg-navy-deep p-6">
            <FakeQr />
            <p className="text-xs text-navy-foreground/60">Placeholder code</p>
          </div>
        </div>
      </Section>
    </>
  );
}
