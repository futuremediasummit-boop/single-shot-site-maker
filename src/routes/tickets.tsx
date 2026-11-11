import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { DraftBadge, PageHero, Section, meta } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { ticketTypes, upcomingSummit } from "@/content/site";

export const Route = createFileRoute("/tickets")({
  head: () => meta("Tickets", "Pick your ticket for the Future Media Summit."),
  component: () => {
    const open = upcomingSummit?.registrationOpen;
    return (
      <>
        <PageHero eyebrow="Tickets" title="Come join us!" intro={open ? "Pick your ticket and get a digital QR ticket by email." : "Tickets aren’t on sale just yet. Preview the options below and sign up to hear first."}>
          <Button asChild variant="gold" size="xl" className="shiny"><Link to="/register">{open ? "Register now" : "Join the waitlist"}</Link></Button>
        </PageHero>
        <Section tone="sky" eyebrow="Ticket types" title="Find your seat" intro="Draft options: names, perks and prices will be confirmed by the organisers.">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ticketTypes.map((t, i) => (
              <div key={t.slug} className={`reveal relative flex flex-col rounded-3xl border bg-card p-7 shadow-card transition hover:-translate-y-2 ${i === 1 ? "ring-4 ring-gold" : ""}`}>
                {i === 1 && <span className="absolute -top-3 right-6 rounded-full bg-blue px-3 py-1 text-xs font-bold text-primary-foreground">Most popular</span>}
                <h3 className="text-xl font-bold">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
                <p className="mt-5 font-display text-3xl font-extrabold text-navy">{t.price}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">{t.perks.map((p) => (<li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue" />{p}</li>))}</ul>
                <div className="mt-6 flex items-center justify-between gap-2">
                  <Button asChild size="sm"><Link to="/register" search={{ tier: t.slug }}>Choose</Link></Button>
                  {t.draft && <DraftBadge>Draft</DraftBadge>}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">Want to see what you’ll receive? <Link to="/ticket/$token" params={{ token: "demo" }} className="font-bold text-blue hover:underline">Open a sample ticket →</Link></p>
        </Section>
      </>
    );
  },
});
