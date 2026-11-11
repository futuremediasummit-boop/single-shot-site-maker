import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, Copy, FileText, Megaphone, Newspaper, Plus, ShieldAlert, Sparkles, Ticket, Users, Handshake, Crown, ClipboardCheck, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { articles, editions, leadership, partners, pressReleases, speakers, ticketTypes } from "@/content/site";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin | Future Media Summit" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Admin,
});

type Row = { id: string; title: string; sub: string; draft: boolean };
type FieldDef = { name: string; label: string; num?: boolean; wide?: boolean };
type Section = { key: string; label: string; icon: typeof Users; rows: Row[]; fields: FieldDef[]; noun: string };

const sections: Section[] = [
  { key: "summits", label: "Summits", icon: CalendarDays, noun: "summit edition", rows: editions.map((e) => ({ id: String(e.year), title: `${e.year} · ${e.edition}`, sub: e.theme, draft: !!e.draft })),
    fields: [{ name: "year", label: "Year", num: true }, { name: "edition", label: "Edition" }, { name: "theme", label: "Theme", wide: true }, { name: "dateLabel", label: "Date" }, { name: "venue", label: "Venue" }, { name: "city", label: "City" }] },
  { key: "speakers", label: "Speakers", icon: Megaphone, noun: "speaker", rows: speakers.map((s) => ({ id: s.slug, title: s.name, sub: `${s.title}, ${s.organisation}`, draft: false })),
    fields: [{ name: "slug", label: "URL name (e.g. jane-doe)" }, { name: "name", label: "Name" }, { name: "title", label: "Job title" }, { name: "organisation", label: "Organisation" }, { name: "role", label: "Role (Keynote, Panellist…)" }, { name: "bio", label: "Bio", wide: true }] },
  { key: "partners", label: "Partners", icon: Handshake, noun: "partner or sponsor", rows: partners.map((p) => ({ id: p.name, title: p.name, sub: `${p.kind} · ${p.category}`, draft: false })),
    fields: [{ name: "name", label: "Name" }, { name: "category", label: "Category or tier" }, { name: "kind", label: "partner or sponsor" }, { name: "url", label: "Website" }] },
  { key: "news", label: "News", icon: Newspaper, noun: "article", rows: articles.map((a) => ({ id: a.slug, title: a.title, sub: `${a.category} · ${a.date}`, draft: false })),
    fields: [{ name: "slug", label: "URL name" }, { name: "title", label: "Title", wide: true }, { name: "category", label: "Category" }, { name: "date", label: "Date" }, { name: "excerpt", label: "Short summary", wide: true }] },
  { key: "press", label: "Press", icon: FileText, noun: "press release", rows: pressReleases.map((p) => ({ id: p.title, title: p.title, sub: p.date, draft: false })),
    fields: [{ name: "title", label: "Title", wide: true }, { name: "date", label: "Date" }, { name: "url", label: "Link to PDF or page" }] },
  { key: "team", label: "Leadership", icon: Crown, noun: "team member", rows: leadership.map((l) => ({ id: l.name, title: l.name, sub: l.title, draft: false })),
    fields: [{ name: "name", label: "Name" }, { name: "title", label: "Job title" }, { name: "bio", label: "Bio", wide: true }] },
  { key: "tickets", label: "Tickets", icon: Ticket, noun: "ticket type", rows: ticketTypes.map((t) => ({ id: t.slug, title: t.name, sub: t.price, draft: !!t.draft })),
    fields: [{ name: "slug", label: "URL name" }, { name: "name", label: "Name" }, { name: "price", label: "Price (e.g. KES 5,000)" }, { name: "blurb", label: "Short description", wide: true }] },
];

/** SAMPLE data so the check-in screen can be designed. Real registrations come from the database. */
const sampleRegs = [
  { id: "r1", name: "Sample Delegate A", email: "a@example.com", tier: "Standard Delegate" },
  { id: "r2", name: "Sample Delegate B", email: "b@example.com", tier: "VIP Delegate" },
  { id: "r3", name: "Sample Delegate C", email: "c@example.com", tier: "Student" },
  { id: "r4", name: "Sample Delegate D", email: "d@example.com", tier: "Media / Press" },
];

function copy(text: string) {
  navigator.clipboard?.writeText(text).then(() => toast.success("Copied!"), () => toast.error("Couldn’t copy. Select the text and copy it by hand."));
}

function AddDialog({ s }: { s: Section }) {
  const [v, setV] = useState<Record<string, string>>({});
  const code = useMemo(() => {
    const o: Record<string, string | number> = {};
    s.fields.forEach((f) => { const x = (v[f.name] ?? "").trim(); if (x) o[f.name] = f.num ? Number(x) || 0 : x; });
    return JSON.stringify(o, null, 2).replace(/"([a-zA-Z]+)":/g, "$1:") + ",";
  }, [v, s.fields]);
  return (
    <Dialog>
      <DialogTrigger asChild><Button size="sm"><Plus /> Add {s.noun}</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle>New {s.noun}</DialogTitle>
          <DialogDescription>Preview only: nothing is saved. Copy the result and paste it into the matching list in <code>src/content/site.ts</code>.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {s.fields.map((f) => (
            <div key={f.name} className={f.wide ? "sm:col-span-2" : ""}>
              <Label htmlFor={`${s.key}-${f.name}`} className="mb-2 block text-sm font-bold">{f.label}</Label>
              <Input id={`${s.key}-${f.name}`} maxLength={300} value={v[f.name] ?? ""} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="relative rounded-2xl bg-navy p-5 text-navy-foreground">
          <pre className="overflow-x-auto pr-20 text-sm">{code}</pre>
          <Button type="button" variant="gold" size="sm" className="absolute right-3 top-3" onClick={() => copy(code)}><Copy /> Copy</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContentTab({ s }: { s: Section }) {
  const [pub, setPub] = useState<Record<string, boolean>>(() => Object.fromEntries(s.rows.map((r) => [r.id, !r.draft])));
  const flip = (r: Row) => { setPub((p) => ({ ...p, [r.id]: !p[r.id] })); toast.info("Preview only: the real Draft/Published switch saves once the database is connected."); };
  return (
    <div className="animate-pop rounded-3xl border bg-card p-5 shadow-card sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold">{s.label}</h2><p className="text-sm text-muted-foreground">{s.rows.length} {s.rows.length === 1 ? "item" : "items"} · {Object.values(pub).filter(Boolean).length} published</p></div>
        <AddDialog s={s} />
      </div>
      {s.rows.length ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Details</TableHead><TableHead className="text-right">Published</TableHead></TableRow></TableHeader>
            <TableBody>
              {s.rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-bold">{r.title}</TableCell>
                  <TableCell className="text-muted-foreground">{r.sub}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${pub[r.id] ? "bg-mint text-navy" : "bg-gold text-navy"}`}>{pub[r.id] ? "Published" : "Draft"}</span>
                      <Switch checked={!!pub[r.id]} onCheckedChange={() => flip(r)} aria-label={`Publish ${r.title}`} />
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed p-10 text-center"><Sparkles className="animate-twinkle mx-auto h-7 w-7 text-gold" /><p className="mt-3 font-bold">Nothing here yet</p><p className="text-sm text-muted-foreground">Use “Add {s.noun}” to prepare your first one.</p></div>
      )}
    </div>
  );
}

function Registrations() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const list = sampleRegs.filter((r) => `${r.name} ${r.email} ${r.tier}`.toLowerCase().includes(q.toLowerCase()));
  const n = Object.values(done).filter(Boolean).length;
  return (
    <div className="animate-pop rounded-3xl border bg-card p-5 shadow-card sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-bold">Registrations &amp; check-in</h2><p className="text-sm text-muted-foreground"><span className="font-bold text-blue">Sample data</span> · {n} of {sampleRegs.length} checked in</p></div>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or ticket" aria-label="Search registrations" className="max-w-xs rounded-full" />
      </div>
      <div className="mb-5 h-3 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-mint transition-all duration-500" style={{ width: `${(n / sampleRegs.length) * 100}%` }} /></div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Ticket</TableHead><TableHead className="text-right">Checked in</TableHead></TableRow></TableHeader>
          <TableBody>
            {list.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-bold">{r.name}</TableCell><TableCell className="text-muted-foreground">{r.email}</TableCell><TableCell>{r.tier}</TableCell>
                <TableCell className="text-right"><Switch checked={!!done[r.id]} onCheckedChange={(c) => setDone({ ...done, [r.id]: c })} aria-label={`Check in ${r.name}`} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Overview() {
  const total = sections.reduce((a, s) => a + s.rows.length, 0);
  const todo = ["Real login and roles (Lovable Cloud)", "Move site.ts lists into database tables", "Save contact, partner, accreditation and newsletter forms", "Real registrations and QR check-in", "Official dates, venue and photos from the organisers"];
  return (
    <div className="animate-pop space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {sections.map((s, i) => (
          <div key={s.key} className={`rounded-3xl p-5 ${["bg-mint/40", "bg-sky/40", "bg-gold/30", "bg-mist"][i % 4]}`}>
            <s.icon className="h-5 w-5 text-navy" />
            <div className="mt-2 font-display text-4xl font-extrabold text-navy">{s.rows.length}</div>
            <div className="text-sm font-bold">{s.label}</div>
          </div>
        ))}
        <div className="rounded-3xl bg-navy p-5 text-navy-foreground"><Users className="h-5 w-5 text-gold" /><div className="mt-2 font-display text-4xl font-extrabold">{total}</div><div className="text-sm font-bold">Items in total</div></div>
      </div>
      <div className="rounded-3xl border bg-card p-6 shadow-card">
        <h2 className="text-xl font-bold">Still to do before launch</h2>
        <ul className="mt-4 space-y-3">{todo.map((t) => (<li key={t} className="flex items-start gap-3"><span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-blue" /><span>{t}</span></li>))}</ul>
      </div>
    </div>
  );
}

function Admin() {
  return (
    <>
      <PageHero eyebrow="Admin" title="Summit control room" intro="Everything you’ll manage, in one place." />
      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-8 flex gap-4 rounded-3xl border-2 border-gold bg-gold/20 p-5">
            <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-navy" />
            <p className="text-sm"><span className="font-bold">Preview only: no login yet, and nothing here saves.</span> It’s the design for the real admin. Accounts, roles and saving need the database, so ask Lovable to connect it (the prompt is in your chat notes). Until then, use “Add” to prepare content for <code>site.ts</code>.</p>
          </div>
          <Tabs defaultValue="overview">
            <TabsList className="mb-6 h-auto w-full flex-wrap justify-start gap-2 rounded-3xl bg-mist p-2">
              <TabsTrigger value="overview" className="gap-2 rounded-full"><LayoutDashboard className="h-4 w-4" />Overview</TabsTrigger>
              {sections.map((s) => (<TabsTrigger key={s.key} value={s.key} className="gap-2 rounded-full"><s.icon className="h-4 w-4" />{s.label}</TabsTrigger>))}
              <TabsTrigger value="regs" className="gap-2 rounded-full"><ClipboardCheck className="h-4 w-4" />Check-in</TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><Overview /></TabsContent>
            {sections.map((s) => (<TabsContent key={s.key} value={s.key}><ContentTab s={s} /></TabsContent>))}
            <TabsContent value="regs"><Registrations /></TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
}
