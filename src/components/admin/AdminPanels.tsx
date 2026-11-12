import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Download, KeyRound, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  adminAddStaff, adminListStaff, adminListSubmissions, adminListTickets, adminRemoveStaff, adminSetCheckedIn, adminSetHandled, adminSetPassword,
  type EventLite, type Role, type StaffRow, type SubmissionRow, type TicketRow,
} from "@/lib/admin-api";
import type { AdminAuth } from "@/lib/admin-store";

type Auth = Pick<AdminAuth, "getToken" | "signOut">;

/** Loads something with the admin token; signs out if the session has ended. */
function useLoader<T>(auth: Auth, fetcher: (token: string) => Promise<{ ok: true } & T | { ok: false; error: string; auth?: boolean }>) {
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState("");
  const { getToken, signOut } = auth;
  const reload = useCallback(async () => {
    setError("");
    try {
      const r = await fetcher(await getToken());
      if (r.ok) setValue(r as T); else { if (r.auth) signOut(); setError(r.error); }
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn’t load this."); }
  }, [fetcher, getToken, signOut]);
  useEffect(() => { void reload(); }, [reload]);
  return { value, setValue, error, reload };
}

function Frame({ title, note, right, children }: { title: string; note?: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="animate-pop space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-extrabold">{title}</h1>{note && <p className="text-sm text-muted-foreground">{note}</p>}</div>{right}</div>
      {children}
    </div>
  );
}
const ErrorBox = ({ msg }: { msg: string }) => <p role="alert" className="rounded-2xl bg-destructive/10 p-4 text-sm font-bold text-destructive">{msg}</p>;

/* ── Check-in: real registrations ── */
export function CheckInPanel({ auth }: { auth: Auth }) {
  const fetcher = useCallback((token: string) => adminListTickets({ data: { token } }), []);
  const { value, setValue, error } = useLoader<{ tickets: TicketRow[]; events: EventLite[] }>(auth, fetcher);
  const [q, setQ] = useState("");
  const tickets = value?.tickets ?? [];
  const eventName = (id: string) => value?.events.find((e) => e.id === id)?.name ?? id;
  const list = useMemo(() => tickets.filter((t) => `${t.name} ${t.email} ${t.code} ${t.type_slug}`.toLowerCase().includes(q.toLowerCase())), [tickets, q]);
  const valid = tickets.filter((t) => t.status !== "cancelled");
  const n = valid.filter((t) => t.checked_in_at).length;

  async function toggle(t: TicketRow, checked: boolean) {
    try {
      const r = await adminSetCheckedIn({ data: { token: await auth.getToken(), ticketToken: t.token, checkedIn: checked } });
      if (!r.ok) { if (r.auth) auth.signOut(); toast.error(r.error); return; }
      setValue((v) => v && { ...v, tickets: v.tickets.map((x) => (x.token === t.token ? { ...x, checked_in_at: r.checkedInAt } : x)) });
    } catch { toast.error("Couldn’t update. Try again."); }
  }

  return (
    <Frame title="Check-in" note={value ? <>{n} of {valid.length} checked in · {tickets.length} registrations</> : "Loading…"}
      right={<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or code" aria-label="Search registrations" className="max-w-xs rounded-full" />}>
      {error && <ErrorBox msg={error} />}
      <div className="h-3 overflow-hidden rounded-full bg-card"><div className="h-full rounded-full bg-mint transition-all duration-500" style={{ width: `${valid.length ? (n / valid.length) * 100 : 0}%` }} /></div>
      {value && !tickets.length ? <p className="rounded-3xl border-2 border-dashed bg-card p-10 text-center text-muted-foreground">No registrations yet. They appear here as soon as someone registers.</p> : (
        <div className="overflow-x-auto rounded-3xl border bg-card p-3 shadow-card">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Ticket</TableHead><TableHead>Code</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Checked in</TableHead></TableRow></TableHeader>
            <TableBody>{list.map((t) => (
              <TableRow key={t.token}>
                <TableCell><div className="font-bold">{t.name}</div><div className="text-xs text-muted-foreground">{t.email}</div></TableCell>
                <TableCell>{t.type_slug}<div className="text-xs text-muted-foreground">{eventName(t.event_id)}</div></TableCell>
                <TableCell><code className="text-xs">{t.code}</code></TableCell>
                <TableCell><span className={`rounded-full px-3 py-1 text-xs font-bold ${t.status === "issued" ? "bg-mint" : t.status === "pending_payment" ? "bg-gold" : "bg-destructive/15 text-destructive"}`}>{t.status.replace("_", " ")}</span></TableCell>
                <TableCell className="text-right"><Switch checked={!!t.checked_in_at} disabled={t.status !== "issued"} onCheckedChange={(c) => void toggle(t, c)} aria-label={`Check in ${t.name}`} /></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
    </Frame>
  );
}

/* ── Inbox: form submissions ── */
const kindLabel: Record<SubmissionRow["kind"], string> = { contact: "Contact", partner: "Partner", accreditation: "Accreditation", newsletter: "Newsletter" };
const csvCell = (v: string) => `"${v.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`; // quotes, and defuses spreadsheet formulas

export function InboxPanel({ auth }: { auth: Auth }) {
  const fetcher = useCallback((token: string) => adminListSubmissions({ data: { token } }), []);
  const { value, setValue, error } = useLoader<{ submissions: SubmissionRow[] }>(auth, fetcher);
  const [kind, setKind] = useState<"all" | SubmissionRow["kind"]>("all");
  const [open, setOpen] = useState<string | null>(null);
  const all = value?.submissions ?? [];
  const list = all.filter((s) => kind === "all" || s.kind === kind);

  async function setHandled(s: SubmissionRow, handled: boolean) {
    try {
      const r = await adminSetHandled({ data: { token: await auth.getToken(), id: s.id, handled } });
      if (!r.ok) { if (r.auth) auth.signOut(); toast.error(r.error); return; }
      setValue((v) => v && { submissions: v.submissions.map((x) => (x.id === s.id ? { ...x, handled } : x)) });
    } catch { toast.error("Couldn’t update. Try again."); }
  }
  function exportCsv() {
    const rows = [["Date", "Type", "Name", "Email", "Details", "Handled"], ...list.map((s) => [s.created_at, s.kind, s.name, s.email, Object.entries(s.payload).map(([k, v]) => `${k}: ${v}`).join(" | "), s.handled ? "yes" : "no"])];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "fms-inbox.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <Frame title="Inbox" note={value ? `${all.length} messages · ${all.filter((s) => !s.handled).length} not handled yet` : "Loading…"}
      right={<Button variant="outline" size="sm" onClick={exportCsv} disabled={!list.length}><Download /> Export CSV</Button>}>
      {error && <ErrorBox msg={error} />}
      <div className="flex flex-wrap gap-1 rounded-full bg-card p-1 shadow-sm sm:w-fit">
        {(["all", "contact", "partner", "accreditation", "newsletter"] as const).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize transition ${kind === k ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:text-foreground"}`}>{k}</button>
        ))}
      </div>
      {value && !list.length ? <p className="rounded-3xl border-2 border-dashed bg-card p-10 text-center text-muted-foreground">Nothing here yet. Messages from your website forms land in this inbox.</p> : (
        <div className="grid gap-3">{list.map((s) => (
          <article key={s.id} className={`rounded-3xl border bg-card p-5 shadow-card ${s.handled ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><span className="rounded-full bg-mist px-3 py-1 text-xs font-bold">{kindLabel[s.kind]}</span> <span className="ml-2 font-bold">{s.name || s.email}</span><div className="mt-1 text-xs text-muted-foreground">{s.email} · {new Date(s.created_at).toLocaleString()}</div></div>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="ghost" onClick={() => setOpen(open === s.id ? null : s.id)}>{open === s.id ? "Hide" : "Read"}</Button>
                <label className="flex items-center gap-2 text-sm font-bold">Handled<Switch checked={s.handled} onCheckedChange={(c) => void setHandled(s, c)} aria-label="Mark handled" /></label>
              </div>
            </div>
            {open === s.id && <dl className="mt-4 space-y-2 rounded-2xl bg-mist/60 p-4 text-sm">{Object.entries(s.payload).map(([k, v]) => (<div key={k}><dt className="text-xs font-bold uppercase text-muted-foreground">{k}</dt><dd className="whitespace-pre-wrap">{v}</dd></div>))}</dl>}
          </article>
        ))}</div>
      )}
    </Frame>
  );
}

/* ── Team: staff accounts ── */
export function TeamPanel({ auth, selfId }: { auth: Auth; selfId: string }) {
  const fetcher = useCallback((token: string) => adminListStaff({ data: { token } }), []);
  const { value, error, reload } = useLoader<{ staff: StaffRow[] }>(auth, fetcher);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [role, setRole] = useState<Role>("editor");
  const [busy, setBusy] = useState(false);

  async function run(label: string, fn: (token: string) => Promise<{ ok: boolean; error?: string; auth?: boolean }>) {
    setBusy(true);
    try {
      const r = await fn(await auth.getToken());
      if (!r.ok) { if (r.auth) auth.signOut(); toast.error(r.error ?? "That didn’t work."); return false; }
      toast.success(label); await reload(); return true;
    } catch { toast.error("Couldn’t reach the server."); return false; }
    finally { setBusy(false); }
  }
  async function add() { if (await run("Team member added.", (token) => adminAddStaff({ data: { token, email, password, role } }))) { setEmail(""); setPassword(""); } }
  function reset(s: StaffRow) {
    const p = window.prompt(`New password for ${s.email} (10 to 72 characters). Share it with them privately.`);
    if (p) void run("Password changed.", (token) => adminSetPassword({ data: { token, userId: s.user_id, password: p } }));
  }
  function remove(s: StaffRow) {
    if (window.confirm(`Remove ${s.email}? They will lose access immediately.`)) void run("Removed.", (token) => adminRemoveStaff({ data: { token, userId: s.user_id } }));
  }

  return (
    <Frame title="Team" note="Everyone who can sign in to this admin.">
      {error && <ErrorBox msg={error} />}
      <div className="rounded-3xl border bg-card p-6 shadow-card">
        <h2 className="flex items-center gap-2 text-lg font-bold"><UserPlus className="h-5 w-5 text-blue" />Add a team member</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
          <div><Label htmlFor="t-email" className="mb-2 block text-sm font-bold">Email</Label><Input id="t-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} /></div>
          <div><Label htmlFor="t-pass" className="mb-2 block text-sm font-bold">Temporary password</Label><Input id="t-pass" type="text" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={72} /></div>
          <div><Label htmlFor="t-role" className="mb-2 block text-sm font-bold">Role</Label><select id="t-role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="editor">Editor</option><option value="admin">Admin</option></select></div>
          <Button onClick={() => void add()} disabled={busy || !email || password.length < 10}>Add</Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Editors write and publish content. Admins also manage check-in, the inbox and the team. Send the temporary password privately and ask them to change it after signing in.</p>
      </div>
      <div className="overflow-x-auto rounded-3xl border bg-card p-3 shadow-card">
        <Table>
          <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>{(value?.staff ?? []).map((s) => (
            <TableRow key={s.user_id}>
              <TableCell className="font-bold">{s.email}{s.user_id === selfId && <span className="ml-2 rounded-full bg-mint px-2 py-0.5 text-xs">you</span>}</TableCell>
              <TableCell className="capitalize">{s.role}</TableCell>
              <TableCell className="text-right"><span className="inline-flex gap-1">
                <Button size="sm" variant="outline" onClick={() => reset(s)} disabled={busy}><KeyRound /> Reset password</Button>
                {s.user_id !== selfId && <Button size="icon" variant="ghost" onClick={() => remove(s)} disabled={busy} aria-label={`Remove ${s.email}`}><Trash2 className="text-destructive" /></Button>}
              </span></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div>
    </Frame>
  );
}
