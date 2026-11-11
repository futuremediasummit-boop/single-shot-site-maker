import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ComponentType } from "react";
import { CalendarDays, ClipboardCheck, Copy, Crown, FileText, Globe, Handshake, LayoutDashboard, Megaphone, Newspaper, Pencil, Plus, Rocket, Search, ShieldAlert, Sparkles, Ticket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ItemEditor, ShareBox } from "@/components/admin/AdminParts";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collections, copyText, exportCode, useAdminStore, type Collection, type CollectionKey, type Item } from "@/lib/admin-store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin | Future Media Summit" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Admin,
});

type View = "overview" | CollectionKey | "publish" | "checkin";
type Icon = ComponentType<{ className?: string }>;
const icons: Record<CollectionKey, Icon> = { news: Newspaper, summits: CalendarDays, speakers: Megaphone, partners: Handshake, press: FileText, team: Crown, tickets: Ticket };
const tints = ["bg-mint/50", "bg-sky/50", "bg-gold/40", "bg-blue/15", "bg-mist"];

const sampleRegs = [
  { id: "r1", name: "Sample Delegate A", email: "a@example.com", tier: "Standard Delegate" },
  { id: "r2", name: "Sample Delegate B", email: "b@example.com", tier: "VIP Delegate" },
  { id: "r3", name: "Sample Delegate C", email: "c@example.com", tier: "Student" },
  { id: "r4", name: "Sample Delegate D", email: "d@example.com", tier: "Media / Press" },
];

function blank(col: Collection): Item {
  const it: Item = { id: `${col.key}-${Date.now().toString(36)}`, published: false, updatedAt: 0 };
  col.fields.forEach((f) => { it[f.name] = f.kind === "toggle" ? false : ""; });
  if (col.key === "news") it.date = new Date().toISOString().slice(0, 10);
  return it;
}

function Admin() {
  const store = useAdminStore();
  const [view, setView] = useState<View>("overview");
  const nav: { id: View; label: string; icon: Icon; count?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    ...collections.map((c) => ({ id: c.key as View, label: c.label, icon: icons[c.key], count: store.data[c.key].length })),
    { id: "checkin", label: "Check-in", icon: ClipboardCheck },
    { id: "publish", label: "Publish", icon: Rocket },
  ];
  const active = collections.find((c) => c.key === view);

  return (
    <div className="min-h-screen bg-mist/40 lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="surface-navy relative overflow-hidden lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="blob -left-10 top-1/3 hidden h-52 w-52 bg-blue/30 lg:block" />
        <div className="relative flex items-center justify-between px-5 py-4 lg:block lg:p-6">
          <Link to="/" aria-label="Back to the website"><Logo /></Link>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-navy-foreground/25 px-3 py-1 text-xs font-bold hover:bg-navy-foreground/10 lg:mt-5"><Globe className="h-3.5 w-3.5" />View site</Link>
        </div>
        <nav className="relative flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:gap-1 lg:px-4 lg:pb-8" aria-label="Admin sections">
          {nav.map((n) => (
            <button key={n.id} type="button" onClick={() => setView(n.id)} aria-current={view === n.id ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-bold transition ${view === n.id ? "bg-blue text-primary-foreground shadow-lg" : "text-navy-foreground/75 hover:bg-navy-foreground/10 hover:text-navy-foreground"}`}>
              <n.icon className="h-4 w-4" /><span className="flex-1 text-left">{n.label}</span>
              {n.count !== undefined && <span className={`rounded-full px-2 text-xs ${view === n.id ? "bg-white/25" : "bg-navy-foreground/10"}`}>{n.count}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-8 lg:py-10">
        <div className="mb-8 flex gap-4 rounded-3xl border-2 border-gold bg-gold/20 p-5">
          <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-navy" />
          <div className="text-sm">
            <p className="font-bold">Preview mode: no login, and edits are saved in this browser only.</p>
            <p className="mt-1 text-muted-foreground">You can write, edit and organise everything here. To put it on the live site use the <button type="button" className="font-bold text-blue underline" onClick={() => setView("publish")}>Publish tab</button>. Real accounts and one-click publishing need the database (Lovable Cloud).</p>
          </div>
        </div>
        {!store.ready ? <p className="text-muted-foreground">Loading…</p>
          : view === "overview" ? <Overview store={store} go={setView} />
          : view === "publish" ? <Publish data={store.data} reset={store.reset} />
          : view === "checkin" ? <CheckIn />
          : active ? <CollectionView key={active.key} col={active} store={store} /> : null}
      </main>
    </div>
  );
}

type Store = ReturnType<typeof useAdminStore>;

function Overview({ store, go }: { store: Store; go: (v: View) => void }) {
  const recent = collections.flatMap((c) => store.data[c.key].map((i) => ({ c, i }))).filter((x) => x.i.updatedAt > 0).sort((a, b) => b.i.updatedAt - a.i.updatedAt).slice(0, 5);
  const [editing, setEditing] = useState<{ c: Collection; i: Item } | null>(null);
  return (
    <div className="animate-pop space-y-8">
      <div className="surface-navy relative overflow-hidden rounded-3xl p-8 sm:p-10">
        <div className="blob animate-drift -right-10 -top-16 h-64 w-64 bg-blue/50" />
        <div className="blob animate-drift -bottom-20 left-1/3 h-56 w-56 bg-gold/30 [animation-delay:-5s]" />
        <p className="eyebrow relative text-gold">Welcome back 👋</p>
        <h1 className="relative mt-3 text-4xl font-extrabold sm:text-5xl">Summit control room</h1>
        <p className="relative mt-3 max-w-xl text-navy-foreground/75">Write stories, edit the line-up and get every piece of content ready to share.</p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <Button variant="gold" size="lg" className="shiny" onClick={() => setEditing({ c: collections[0], i: blank(collections[0]) })}><Plus /> Write a story</Button>
          <Button variant="onDark" size="lg" onClick={() => go("publish")}><Rocket /> Publish to the site</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {collections.map((c, i) => {
          const Ic = icons[c.key]; const items = store.data[c.key]; const pub = items.filter((x) => x.published).length;
          return (
            <button type="button" key={c.key} onClick={() => go(c.key)} className={`reveal rounded-3xl p-5 text-left transition hover:-translate-y-1 hover:rotate-1 ${tints[i % tints.length]}`}>
              <Ic className="h-5 w-5 text-navy" />
              <div className="mt-2 font-display text-4xl font-extrabold text-navy">{items.length}</div>
              <div className="text-sm font-bold">{c.label}</div>
              <div className="mt-1 text-xs text-navy/70">{pub} published · {items.length - pub} draft</div>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-card">
        <h2 className="text-xl font-bold">Recently edited</h2>
        {recent.length ? (
          <ul className="mt-4 divide-y">
            {recent.map(({ c, i }) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-3">
                <span><span className="font-bold">{String(i[c.titleKey] || "Untitled")}</span> <span className="text-sm text-muted-foreground">· {c.label}</span></span>
                <Button size="sm" variant="outline" onClick={() => setEditing({ c, i })}><Pencil /> Edit</Button>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-muted-foreground">Nothing edited yet. Click “Write a story” to start.</p>}
      </div>
      {editing && <ItemEditor key={editing.i.id} col={editing.c} item={editing.i} existing={store.data[editing.c.key]} open onClose={() => setEditing(null)} onSave={(it) => store.save(editing.c.key, it)} />}
    </div>
  );
}

function CollectionView({ col, store }: { col: Collection; store: Store }) {
  const items = store.data[col.key];
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [editing, setEditing] = useState<Item | null>(null);
  const Ic = icons[col.key];
  const shown = useMemo(() => items.filter((i) => (filter === "all" || (filter === "published") === i.published) && Object.values(i).join(" ").toLowerCase().includes(q.toLowerCase())), [items, q, filter]);
  const remove = (i: Item) => { if (window.confirm(`Delete “${String(i[col.titleKey] || "this item")}”? This can’t be undone.`)) { store.remove(col.key, i.id); toast.success("Deleted."); } };

  return (
    <div className="animate-pop space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold"><Ic className="h-7 w-7 text-navy" /></span>
          <div><h1 className="text-3xl font-extrabold">{col.label}</h1><p className="text-sm text-muted-foreground">{items.length} total · {items.filter((i) => i.published).length} published</p></div>
        </div>
        <Button size="lg" onClick={() => setEditing(blank(col))}><Plus /> New {col.noun}</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${col.label.toLowerCase()}`} aria-label="Search" className="rounded-full pl-10" />
        </div>
        <div className="flex gap-1 rounded-full bg-card p-1 shadow-sm">
          {(["all", "published", "draft"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize transition ${filter === f ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      {shown.length ? (
        <div className="grid gap-4">
          {shown.map((i) => (
            <article key={i.id} className="rounded-3xl border bg-card p-5 shadow-card transition hover:shadow-lg sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${i.published ? "bg-mint text-navy" : "bg-gold text-navy"}`}>{i.published ? "Published" : "Draft"}</span>
                    <span className="text-xs text-muted-foreground">{String(i[col.subKey] ?? "")}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold">{String(i[col.titleKey] || "Untitled")}</h2>
                  {i.excerpt ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{String(i.excerpt)}</p> : i.bio ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{String(i.bio)}</p> : null}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-bold">Published<Switch checked={i.published} onCheckedChange={(c) => store.save(col.key, { ...i, published: c })} aria-label={`Publish ${String(i[col.titleKey])}`} /></label>
                  <Button size="sm" variant="outline" onClick={() => setEditing(i)}><Pencil /> Edit</Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(i)} aria-label="Delete"><Trash2 className="text-destructive" /></Button>
                </div>
              </div>
              <div className="mt-4"><ShareBox item={i} col={col} /></div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed bg-card p-12 text-center">
          <Sparkles className="animate-twinkle mx-auto h-8 w-8 text-gold" />
          <p className="mt-3 text-lg font-bold">{items.length ? "Nothing matches that" : `No ${col.label.toLowerCase()} yet`}</p>
          <p className="text-sm text-muted-foreground">{items.length ? "Try a different search or filter." : `Click “New ${col.noun}” to add the first one.`}</p>
        </div>
      )}
      {editing && <ItemEditor key={editing.id} col={col} item={editing} existing={items} open onClose={() => setEditing(null)} onSave={(it) => store.save(col.key, it)} />}
    </div>
  );
}

function Publish({ data, reset }: { data: Store["data"]; reset: () => void }) {
  return (
    <div className="animate-pop space-y-6">
      <div><h1 className="text-3xl font-extrabold">Publish to the website</h1><p className="mt-1 max-w-2xl text-muted-foreground">Published items become real pages with their own links once this code is in your site. One-click publishing arrives with the database.</p></div>
      <ol className="grid gap-3 sm:grid-cols-3">
        {["Copy a block below", "In src/content/site.ts, replace the matching “export const …” block with it", "Run git push, then Publish → Update in Lovable"].map((t, i) => (
          <li key={t} className={`flex gap-3 rounded-3xl p-5 text-sm font-bold ${tints[i]}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-navy-foreground">{i + 1}</span>{t}</li>
        ))}
      </ol>
      {collections.map((c) => {
        const code = exportCode(c, data[c.key]); const n = data[c.key].filter((i) => i.published).length;
        return (
          <div key={c.key} className="rounded-3xl border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-bold">{c.label}</h2><p className="text-xs text-muted-foreground">{n} published item{n === 1 ? "" : "s"} · replaces <code>{c.exportName}</code></p></div>
              <Button size="sm" onClick={() => copyText(code, `${c.label} code copied!`)}><Copy /> Copy code</Button>
            </div>
            <pre className="mt-3 max-h-48 overflow-auto rounded-2xl bg-navy p-4 text-xs text-navy-foreground">{code}</pre>
          </div>
        );
      })}
      <div className="rounded-3xl border bg-card p-5"><p className="text-sm text-muted-foreground">Want to wipe your browser edits and go back to the content in <code>site.ts</code>?</p><Button className="mt-3" variant="outline" size="sm" onClick={() => { if (window.confirm("Reset everything in this browser back to the built-in content?")) { reset(); toast.success("Reset."); } }}>Reset to built-in content</Button></div>
    </div>
  );
}

function CheckIn() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const list = sampleRegs.filter((r) => `${r.name} ${r.email} ${r.tier}`.toLowerCase().includes(q.toLowerCase()));
  const n = Object.values(done).filter(Boolean).length;
  return (
    <div className="animate-pop space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold">Check-in</h1><p className="text-sm text-muted-foreground"><span className="font-bold text-blue">Sample data</span> · {n} of {sampleRegs.length} checked in</p></div>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or ticket" aria-label="Search registrations" className="max-w-xs rounded-full" />
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-card"><div className="h-full rounded-full bg-mint transition-all duration-500" style={{ width: `${(n / sampleRegs.length) * 100}%` }} /></div>
      <div className="overflow-x-auto rounded-3xl border bg-card p-3 shadow-card">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Ticket</TableHead><TableHead className="text-right">Checked in</TableHead></TableRow></TableHeader>
          <TableBody>{list.map((r) => (<TableRow key={r.id}><TableCell className="font-bold">{r.name}</TableCell><TableCell className="text-muted-foreground">{r.email}</TableCell><TableCell>{r.tier}</TableCell><TableCell className="text-right"><Switch checked={!!done[r.id]} onCheckedChange={(c) => setDone({ ...done, [r.id]: c })} aria-label={`Check in ${r.name}`} /></TableCell></TableRow>))}</TableBody>
        </Table>
      </div>
    </div>
  );
}
