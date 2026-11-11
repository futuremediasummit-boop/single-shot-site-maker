import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageHero, Section, meta } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, getEvents, registerTicket } from "@/lib/ticketing";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>): { event?: string; tier?: string } => ({
    ...(typeof s["event"] === "string" ? { event: s["event"] } : {}),
    ...(typeof s["tier"] === "string" ? { tier: s["tier"] } : {}),
  }),
  loader: () => getEvents(),
  head: () => meta("Register", "Register for the Future Media Summit and get your digital ticket."),
  component: Register,
});

function Register() {
  const events = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [eventId, setEventId] = useState(events.find((e) => e.id === search.event)?.id ?? events[0]?.id ?? "");
  const ev = events.find((e) => e.id === eventId);
  const types = ev?.ticketTypes.filter((t) => !t.accreditationOnly && !t.soldOut) ?? [];
  const [typeSlug, setTypeSlug] = useState(search.tier ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError("");
    try {
      const r = await registerTicket({ data: { eventId, typeSlug, name: String(f.get("name") ?? ""), email: String(f.get("email") ?? ""), phone: String(f.get("phone") ?? "") } });
      if (r.ok) await navigate({ to: "/ticket/$token", params: { token: r.token } });
      else setError(r.error);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <>
      <PageHero eyebrow="Registration" title="Save your spot" intro="Fill this in and your digital ticket appears right away." />
      <Section>
        {!ev ? <p className="text-muted-foreground">No events are open for registration yet.</p> : (
          <form onSubmit={onSubmit} className="mx-auto grid max-w-2xl gap-5 rounded-3xl border bg-card p-8 shadow-card sm:grid-cols-2">
            <h2 className="text-xl font-bold sm:col-span-2">Your details</h2>
            {events.length > 1 && (
              <div className="sm:col-span-2">
                <Label htmlFor="event" className="mb-2 block text-sm font-bold">Event *</Label>
                <select id="event" value={eventId} onChange={(e) => { setEventId(e.target.value); setTypeSlug(""); }} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {events.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
            )}
            <div><Label htmlFor="name" className="mb-2 block text-sm font-bold">Full name *</Label><Input id="name" name="name" required maxLength={120} /></div>
            <div><Label htmlFor="email" className="mb-2 block text-sm font-bold">Email *</Label><Input id="email" name="email" type="email" required maxLength={200} /></div>
            <div><Label htmlFor="phone" className="mb-2 block text-sm font-bold">Phone (M-Pesa)</Label><Input id="phone" name="phone" type="tel" maxLength={30} /></div>
            <div>
              <Label htmlFor="tier" className="mb-2 block text-sm font-bold">Ticket type *</Label>
              <select id="tier" required value={typeSlug} onChange={(e) => setTypeSlug(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select…</option>
                {types.map((t) => <option key={t.slug} value={t.slug}>{t.name} · {formatPrice(t.priceKes)}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
              <Button type="submit" size="xl" disabled={busy || !ev.open}>{busy ? "Reserving…" : "Reserve my ticket"}</Button>
              {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
            </div>
          </form>
        )}
      </Section>
    </>
  );
}
