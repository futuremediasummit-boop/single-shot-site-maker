import { createServerFn } from "@tanstack/react-start";
import type { CollectionKey } from "@/lib/admin-store";
import type { DraftContent, PublishedContent } from "@/lib/content-backend";

/**
 * Every server function the admin and the public forms use. All Supabase access happens on the
 * server (see supabase.server.ts); the browser only ever sees what these functions return.
 * Admin functions take the signed-in user's access token and re-check their role on EVERY call.
 */

export type Role = "admin" | "editor";
export type Session = { accessToken: string; refreshToken: string; expiresAt: number; userId: string; email: string; role: Role };
type Fail = { ok: false; error: string; auth?: boolean; conflict?: boolean };
export type Res<T extends object> = ({ ok: true } & T) | Fail;

export type TicketRow = { token: string; code: string; name: string; email: string; phone: string; status: "issued" | "pending_payment" | "cancelled"; type_slug: string; event_id: string; checked_in_at: string | null; created_at: string };
export type EventLite = { id: string; name: string };
export type SubmissionRow = { id: string; kind: "contact" | "partner" | "accreditation" | "newsletter"; name: string; email: string; payload: Record<string, string>; handled: boolean; created_at: string };
export type StaffRow = { user_id: string; email: string; role: Role; created_at: string };

type ServerMod = typeof import("./supabase.server");
type Who = import("./supabase.server").Who;
class Conflict extends Error {}

/** Runs an admin action after verifying the token and role. Turns known problems into friendly results. */
async function guarded<T extends object>(token: string, need: Role, fn: (who: Who, s: ServerMod) => Promise<T>): Promise<Res<T>> {
  const s = await import("./supabase.server");
  try {
    const who = await s.requireStaff(token, need);
    return { ok: true as const, ...(await fn(who, s)) };
  } catch (e) {
    if (e instanceof Conflict) return { ok: false as const, error: e.message, conflict: true };
    if (e instanceof s.AuthError) return { ok: false as const, error: e.message, auth: e.signOut };
    console.error(e);
    return { ok: false as const, error: "Something went wrong on the server. Please try again." };
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const toSession = (g: { access_token: string; refresh_token: string; expires_at: number; user: { id: string; email: string } }, role: Role): Session => ({
  accessToken: g.access_token, refreshToken: g.refresh_token, expiresAt: g.expires_at, userId: g.user.id, email: g.user.email, role,
});

/* ── Public ─────────────────────────────────────────────────────────────── */

/** The live copy of the content. Never throws: if Supabase is unreachable the site uses its built-in content. */
export const getPublishedContent = createServerFn({ method: "GET" }).handler(async (): Promise<PublishedContent | null> => {
  try {
    const { db } = await import("./supabase.server");
    const rows = await db.select<{ content: PublishedContent }[]>("fms_content?id=eq.main&select=content&limit=1");
    const c = rows[0]?.content;
    return c && c.v === 1 && c.data ? c : null;
  } catch (e) { console.error("Live content unavailable:", e); return null; }
});

type FormInput = { kind: string; payload: Record<string, string>; hp?: string };
/** Contact, partner, accreditation and newsletter forms. */
export const submitForm = createServerFn({ method: "POST" })
  .validator((d: FormInput) => d)
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (data.hp) return { ok: true }; // honeypot filled in: it's a bot, pretend it worked
    if (!["contact", "partner", "accreditation", "newsletter"].includes(data.kind)) return { ok: false, error: "Unknown form." };
    const payload: Record<string, string> = {};
    for (const [k, v] of Object.entries(data.payload ?? {}).slice(0, 20)) payload[String(k).slice(0, 40)] = String(v ?? "").slice(0, 2000);
    const email = (payload["email"] ?? "").trim().toLowerCase().slice(0, 200);
    if (!EMAIL.test(email)) return { ok: false, error: "Please enter a valid email address." };
    const name = (payload["name"] || payload["contact"] || payload["organisation"] || "").trim().slice(0, 120);
    try {
      const { db } = await import("./supabase.server");
      if (data.kind === "newsletter") {
        const ex = await db.select<{ id: string }[]>(`fms_submissions?kind=eq.newsletter&email=eq.${encodeURIComponent(email)}&select=id&limit=1`);
        if (ex.length) return { ok: true }; // already subscribed
      }
      await db.insert("fms_submissions", { kind: data.kind, name, email, payload });
      return { ok: true };
    } catch (e) { console.error(e); return { ok: false, error: "We couldn’t send that just now. Please try again in a moment." }; }
  });

/* ── Sign in ────────────────────────────────────────────────────────────── */

export const adminSignIn = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }): Promise<{ ok: true; session: Session } | Fail> => {
    const s = await import("./supabase.server");
    try {
      const email = String(data.email ?? "").trim().toLowerCase().slice(0, 200);
      const password = String(data.password ?? "").slice(0, 200);
      if (!email || !password) return { ok: false, error: "Enter your email and password." };
      const g = await s.passwordGrant(email, password);
      const role = await s.staffRole(g.user.id);
      if (!role) return { ok: false, error: "This account doesn’t have admin access." };
      return { ok: true, session: toSession(g, role) };
    } catch (e) {
      if (e instanceof s.AuthError) return { ok: false, error: e.message };
      console.error(e); return { ok: false, error: "Couldn’t sign in right now. Please try again." };
    }
  });

export const adminRefresh = createServerFn({ method: "POST" })
  .validator((d: { refreshToken: string }) => d)
  .handler(async ({ data }): Promise<{ ok: true; session: Session } | Fail> => {
    const s = await import("./supabase.server");
    try {
      const g = await s.refreshGrant(String(data.refreshToken ?? "").slice(0, 500));
      const role = await s.staffRole(g.user.id);
      if (!role) return { ok: false, error: "This account doesn’t have admin access.", auth: true };
      return { ok: true, session: toSession(g, role) };
    } catch (e) {
      if (e instanceof s.AuthError) return { ok: false, error: e.message, auth: true };
      console.error(e); return { ok: false, error: "Couldn’t refresh your session.", auth: true };
    }
  });

/* ── Content: draft + publish ───────────────────────────────────────────── */

export type DraftRow = { content: DraftContent; version: number; updatedAt: string };

export const adminLoad = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(({ data }) => guarded(data.token, "editor", async (who, s) => {
    const [d, m] = await Promise.all([
      s.db.select<{ content: DraftContent; version: number; updated_at: string }[]>("fms_content?id=eq.draft&select=content,version,updated_at&limit=1"),
      s.db.select<{ content: PublishedContent }[]>("fms_content?id=eq.main&select=content&limit=1"),
    ]);
    const draft: DraftRow | null = d[0] ? { content: d[0].content, version: d[0].version, updatedAt: d[0].updated_at } : null;
    return { role: who.role, email: who.email, draft, published: m[0]?.content ?? null };
  }));

export const adminSaveDraft = createServerFn({ method: "POST" })
  .validator((d: { token: string; content: DraftContent; expectedVersion: number }) => d)
  .handler(({ data }) => guarded(data.token, "editor", async (who, s) => {
    const c = data.content;
    if (!c || typeof c !== "object" || !c.data || !c.settings) throw new s.AuthError("That draft looks broken. Reload the page.");
    if (JSON.stringify(c).length > 1_500_000) throw new s.AuthError("The draft is too large to save.");
    const expected = Number(data.expectedVersion) || 0;
    const now = new Date().toISOString();
    const cur = await s.db.select<{ version: number }[]>("fms_content?id=eq.draft&select=version&limit=1");
    if (!cur[0]) {
      if (expected !== 0) throw new Conflict("The saved draft is gone. Reload the page.");
      await s.db.upsert("fms_content", [{ id: "draft", content: c, version: 1, updated_at: now, updated_by: who.email }]);
      return { version: 1, updatedAt: now };
    }
    if (cur[0].version !== expected) throw new Conflict("Someone else just changed the draft. Reload the page to see their changes.");
    const out = await s.db.patch<{ version: number }[]>(`fms_content?id=eq.draft&version=eq.${expected}`, { content: c, version: expected + 1, updated_at: now, updated_by: who.email });
    if (!out[0]) throw new Conflict("Someone else just changed the draft. Reload the page to see their changes.");
    return { version: out[0].version, updatedAt: now };
  }));

/** Copies the saved draft to the live copy. Only items marked Published are copied, so drafts never reach the public. */
export const adminPublish = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(({ data }) => guarded(data.token, "editor", async (who, s) => {
    const rows = await s.db.select<{ content: DraftContent }[]>("fms_content?id=eq.draft&select=content&limit=1");
    const d = rows[0]?.content;
    if (!d) throw new s.AuthError("Nothing to publish yet. Make a change first.");
    const live: PublishedContent["data"] = {};
    for (const k of Object.keys(d.data) as CollectionKey[]) live[k] = (d.data[k] ?? []).filter((i) => i.published);
    const updatedAt = Date.now();
    const content: PublishedContent = { v: 1, updatedAt, data: live, settings: d.settings };
    await s.db.upsert("fms_content", [{ id: "main", content, updated_at: new Date(updatedAt).toISOString(), updated_by: who.email }]);
    return { updatedAt };
  }));

/* ── Admin only: check-in, inbox, team ─────────────────────────────────── */

export const adminListTickets = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(({ data }) => guarded(data.token, "admin", async (_w, s) => {
    const [tickets, events] = await Promise.all([
      s.db.select<TicketRow[]>("fms_tickets?select=token,code,name,email,phone,status,type_slug,event_id,checked_in_at,created_at&order=created_at.desc&limit=2000"),
      s.db.select<EventLite[]>("fms_events?select=id,name"),
    ]);
    return { tickets, events };
  }));

export const adminSetCheckedIn = createServerFn({ method: "POST" })
  .validator((d: { token: string; ticketToken: string; checkedIn: boolean }) => d)
  .handler(({ data }) => guarded(data.token, "admin", async (_w, s) => {
    const t = String(data.ticketToken ?? "");
    if (t.length < 10 || t.length > 64) throw new s.AuthError("That ticket isn’t valid.");
    const at = data.checkedIn ? new Date().toISOString() : null;
    const out = await s.db.patch<{ token: string }[]>(`fms_tickets?token=eq.${encodeURIComponent(t)}`, { checked_in_at: at });
    if (!out[0]) throw new s.AuthError("Ticket not found.");
    return { checkedInAt: at };
  }));

export const adminListSubmissions = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(({ data }) => guarded(data.token, "admin", async (_w, s) => ({
    submissions: await s.db.select<SubmissionRow[]>("fms_submissions?select=*&order=created_at.desc&limit=500"),
  })));

export const adminSetHandled = createServerFn({ method: "POST" })
  .validator((d: { token: string; id: string; handled: boolean }) => d)
  .handler(({ data }) => guarded(data.token, "admin", async (_w, s) => {
    if (!s.isUuid(data.id)) throw new s.AuthError("That message isn’t valid.");
    await s.db.patch(`fms_submissions?id=eq.${data.id}`, { handled: !!data.handled });
    return {};
  }));

export const adminListStaff = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => d)
  .handler(({ data }) => guarded(data.token, "admin", async (_w, s) => ({
    staff: await s.db.select<StaffRow[]>("fms_staff?select=user_id,email,role,created_at&order=created_at.asc"),
  })));

export const adminAddStaff = createServerFn({ method: "POST" })
  .validator((d: { token: string; email: string; password: string; role: Role }) => d)
  .handler(({ data }) => guarded(data.token, "admin", async (_w, s) => {
    const email = String(data.email ?? "").trim().toLowerCase().slice(0, 200);
    const password = String(data.password ?? "");
    const role: Role = data.role === "admin" ? "admin" : "editor";
    if (!EMAIL.test(email)) throw new s.AuthError("Please enter a valid email address.");
    if (password.length < 10 || password.length > 72) throw new s.AuthError("The temporary password needs 10 to 72 characters.");
    let created: { id: string };
    try { created = await s.createUser(email, password); }
    catch (e) { throw new s.AuthError(e instanceof Error ? e.message : "Couldn’t create the account."); }
    try { await s.db.insert("fms_staff", { user_id: created.id, email, role }); }
    catch (e) { await s.deleteUser(created.id).catch(() => undefined); throw e; }
    return {};
  }));

export const adminRemoveStaff = createServerFn({ method: "POST" })
  .validator((d: { token: string; userId: string }) => d)
  .handler(({ data }) => guarded(data.token, "admin", async (who, s) => {
    if (!s.isUuid(data.userId)) throw new s.AuthError("That person isn’t valid.");
    if (data.userId === who.id) throw new s.AuthError("You can’t remove yourself.");
    const admins = await s.db.select<{ user_id: string }[]>("fms_staff?role=eq.admin&select=user_id");
    if (admins.length <= 1 && admins[0]?.user_id === data.userId) throw new s.AuthError("There must always be at least one admin.");
    await s.db.remove(`fms_staff?user_id=eq.${data.userId}`);
    await s.deleteUser(data.userId).catch((e) => console.error(e));
    return {};
  }));

/** Change your own password (any staff) or reset someone else's (admins only). */
export const adminSetPassword = createServerFn({ method: "POST" })
  .validator((d: { token: string; userId?: string; password: string }) => d)
  .handler(({ data }) => guarded(data.token, "editor", async (who, s) => {
    const target = data.userId ?? who.id;
    if (!s.isUuid(target)) throw new s.AuthError("That person isn’t valid.");
    if (target !== who.id && who.role !== "admin") throw new s.AuthError("Only admins can reset other people’s passwords.");
    const password = String(data.password ?? "");
    if (password.length < 10 || password.length > 72) throw new s.AuthError("The password needs 10 to 72 characters.");
    await s.setUserPassword(target, password);
    return {};
  }));
