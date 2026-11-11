import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AwaitingContent, DraftBadge, PageHero, Section, meta } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { formatPrice, getEvents } from "@/lib/ticketing";

export const Route = createFileRoute("/tickets")({
  validateSearch: (s: Record<string, unknown>): { event?: string } => (typeof s["event"] === "string" ? { event: s["event"] } : {}),
  loader: () => getEvents(),
  head: () => meta("Tickets", "Pick your event and ticket for the Future Media Summit."),
  component: Tickets,
});

function Tickets() {
  const events = Route.useLoaderData();
  const { event: eventParam } = Route.useSearch();
  const navigate = useNavigate({ from: "/tickets" });
  const ev = events.find((e) => e.id === eventParam) ?? events[0];

  if (!ev) {
    return (<><PageHero eyebrow="Tickets" title="Come join us!" /><Section><AwaitingContent title="No events on sale yet" body="Events and tickets will appear here as soon as they are announced." /></Section></>);
  }
  return (
    <>
      <PageHero eyebrow="Tickets" title="Come join us!" intro={ev.open ? "Pick your event and ticket, and get a digital QR ticket instantly." : "Tickets for this event aren’t on sale just yet."}>
        {events.length > 1 && (
          <label className="mb-6 block max-w-md text-sm font-bold text-navy-foreground">
            Choose an event
            <select value={ev.id} onChange={(e) => navigate({ search: { event: e.target.value } })} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground">
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
        )}
        <p className="mb-6 text-navy-foreground/80">{ev.name} · {ev.dateLabel} · {ev.venue}, {ev.city}</p>
        {ev.open && <Button asChild variant="gold" size="xl" className="shiny"><Link to="/register" search={{ event: ev.id }}>Register now</Link></Button>}
      </PageHero>
      <Section tone="sky" eyebrow="Ticket types" title="Find your seat" {...(ev.draft ? { intro: "Draft options: names, perks and prices will be confirmed by the organisers." } : {})}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ev.ticketTypes.map((t, i) => (
            <div key={t.slug} className={`reveal relative flex flex-col rounded-3xl border bg-card p-7 shadow-card transition hover:-translate-y-2 ${i === 1 ? "ring-4 ring-gold" : ""}`}>
              {i === 1 && <span className="absolute -top-3 right-6 rounded-full bg-blue px-3 py-1 text-xs font-bold text-primary-foreground">Most popular</span>}
              <h3 className="text-xl font-bold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
              <p className="mt-5 font-display text-3xl font-extrabold text-navy">{formatPrice(t.priceKes)}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm">{t.perks.map((p) => (<li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue" />{p}</li>))}</ul>
              <div className="mt-6 flex items-center justify-between gap-2">
                {t.accreditationOnly ? (
                  <Button asChild size="sm" variant="outline"><Link to="/media/accreditation">Apply for accreditation</Link></Button>
                ) : t.soldOut ? (
                  <span className="text-sm font-bold text-muted-foreground">Sold out</span>
                ) : (
                  <Button asChild size="sm" disabled={!ev.open}><Link to="/register" search={{ event: ev.id, tier: t.slug }}>Choose</Link></Button>
                )}
                {ev.draft && <DraftBadge>Draft</DraftBadge>}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
