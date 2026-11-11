import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PageHero, Section } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { articles, editions, leadership, partners, pressReleases, speakers, ticketTypes } from "@/content/site";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin | Future Media Summit" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Admin,
});

const LOVABLE_PROMPT = `Build Phase 2 and 3 of the roadmap with Lovable Cloud:
1. Email + password login with Lovable Cloud auth. Roles table (admin, editor) kept separate from profiles, checked server-side with a has_role security-definer function. No client-side role checks.
2. An /admin area, only for signed-in admins and editors, to create, edit, publish and unpublish: summits and editions, speakers, partners and sponsors, news articles, press releases, leadership and homepage stats. Include a Draft/Published switch on each item.
3. Move the lists in src/content/site.ts into database tables; public pages read only published rows. Keep the designed "coming soon" states when a table is empty.
4. Save the contact, partner, accreditation and newsletter form submissions to tables that only admins can read.
5. Admins can view registrations and mark tickets as checked in.
Use row-level security on every table. Do not store secrets in the repo.`;

function copy(text: string) {
  navigator.clipboard?.writeText(text).then(() => toast.success("Copied!"), () => toast.error("Couldn’t copy. Select the text and copy it by hand."));
}

function Admin() {
  const [f, setF] = useState({ year: "2026", edition: "3rd Edition", theme: "", dateLabel: "", venue: "", city: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const q = (v: string) => JSON.stringify(v);
  const snippet = `{\n  year: ${Number(f.year) || 0},\n  edition: ${q(f.edition)},\n  theme: ${q(f.theme)},\n  dateLabel: ${q(f.dateLabel)},\n  venue: ${q(f.venue)},\n  city: ${q(f.city)},\n  registrationOpen: false,\n},`;

  const cards = [
    { label: "Summit editions", n: editions.length, note: `${editions.filter((e) => e.draft).length} draft` },
    { label: "Speakers", n: speakers.length },
    { label: "Partners & sponsors", n: partners.length },
    { label: "News articles", n: articles.length },
    { label: "Press releases", n: pressReleases.length },
    { label: "Leadership", n: leadership.length },
    { label: "Ticket types", n: ticketTypes.length, note: `${ticketTypes.filter((t) => t.draft).length} draft` },
  ];

  return (
    <>
      <PageHero eyebrow="Admin" title="Summit control room" intro="One place to manage summits, speakers, partners, news and tickets." />
      <Section>
        <div className="mb-10 flex gap-4 rounded-3xl border-2 border-gold bg-gold/20 p-6">
          <ShieldAlert className="mt-1 h-6 w-6 shrink-0 text-navy" />
          <div>
            <p className="font-bold">Preview only: this page is not protected yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">There’s no login or saving here. Real admin accounts, roles and publishing need the database (Lovable Cloud). The prompt at the bottom of this page asks Lovable to build it properly. Until then, use the snippet maker to prepare content.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold">What’s on the site right now</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-3xl border bg-card p-6 shadow-card">
              <div className="font-display text-5xl font-extrabold text-navy">{c.n}</div>
              <div className="mt-1 text-sm font-medium">{c.label}</div>
              {c.note && <div className="mt-2 text-xs font-bold text-blue">{c.note}</div>}
            </div>
          ))}
        </div>
      </Section>

      <Section tone="mint" eyebrow="Snippet maker" title="Add a summit edition" intro="Fill in the details, copy the result and paste it inside the editions list in src/content/site.ts.">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="grid gap-4 rounded-3xl border bg-card p-6 shadow-card sm:grid-cols-2">
            {([["year", "Year"], ["edition", "Edition"], ["theme", "Theme"], ["dateLabel", "Date"], ["venue", "Venue"], ["city", "City"]] as const).map(([k, label]) => (
              <div key={k} className={k === "theme" ? "sm:col-span-2" : ""}><Label htmlFor={k} className="mb-2 block text-sm font-bold">{label}</Label><Input id={k} value={f[k]} onChange={set(k)} maxLength={120} /></div>
            ))}
          </div>
          <div className="relative rounded-3xl bg-navy p-6 text-navy-foreground">
            <pre className="overflow-x-auto text-sm leading-relaxed">{snippet}</pre>
            <Button type="button" variant="gold" size="sm" className="absolute right-4 top-4" onClick={() => copy(snippet)}><Copy /> Copy</Button>
          </div>
        </div>
      </Section>

      <Section eyebrow="Real accounts" title="Make it a real admin" intro="Paste this into the Lovable chat. It sets up login, roles and a protected admin area with a Draft/Published switch.">
        <div className="relative rounded-3xl border bg-card p-6 shadow-card">
          <pre className="whitespace-pre-wrap pr-24 text-sm leading-relaxed">{LOVABLE_PROMPT}</pre>
          <Button type="button" size="sm" className="absolute right-4 top-4" onClick={() => copy(LOVABLE_PROMPT)}><Copy /> Copy</Button>
        </div>
      </Section>
    </>
  );
}
