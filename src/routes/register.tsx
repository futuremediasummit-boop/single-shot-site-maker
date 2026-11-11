import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { DraftBadge, PageHero, Section, meta } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ticketTypes } from "@/content/site";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>) => ({ tier: typeof s.tier === "string" ? s.tier : undefined }),
  head: () => meta("Register", "Register as a delegate for the Future Media Summit."),
  component: Register,
});

function Register() {
  const { tier } = Route.useSearch();
  const [sent, setSent] = useState(false);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    toast.info("Preview mode: nothing is saved yet. Registrations will be stored once the backend is connected.");
  }
  return (
    <>
      <PageHero eyebrow="Registration" title="Save your spot" intro="Fill this in and we’ll email your digital ticket." />
      <Section>
        <form onSubmit={onSubmit} className="mx-auto grid max-w-2xl gap-5 rounded-3xl border bg-card p-8 shadow-card sm:grid-cols-2">
          <div className="sm:col-span-2 flex items-center justify-between"><h2 className="text-xl font-bold">Your details</h2><DraftBadge>Preview form</DraftBadge></div>
          <div><Label htmlFor="name" className="mb-2 block text-sm font-bold">Full name *</Label><Input id="name" name="name" required maxLength={120} /></div>
          <div><Label htmlFor="email" className="mb-2 block text-sm font-bold">Email *</Label><Input id="email" name="email" type="email" required maxLength={200} /></div>
          <div><Label htmlFor="phone" className="mb-2 block text-sm font-bold">Phone (M-Pesa)</Label><Input id="phone" name="phone" type="tel" maxLength={30} /></div>
          <div>
            <Label htmlFor="tier" className="mb-2 block text-sm font-bold">Ticket type *</Label>
            <select id="tier" name="tier" required defaultValue={tier ?? ""} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select…</option>
              {ticketTypes.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
            <Button type="submit" size="xl">Reserve my ticket</Button>
            {sent && <p className="text-sm text-muted-foreground">Thanks! This is a preview, so nothing was sent.</p>}
          </div>
        </form>
      </Section>
    </>
  );
}
