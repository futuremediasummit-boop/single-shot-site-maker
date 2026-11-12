// Server-only. Never import this from a component: use the server functions in ./admin-api.ts.
// Talks to Supabase with plain fetch (works on Cloudflare Workers). Secrets come from the server
// environment and never reach the browser: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

/** Thrown for "please sign in again" and "you are not allowed" situations. */
export class AuthError extends Error {
  constructor(message: string, public signOut = false) { super(message); }
}

function cfg() {
  const url = process.env["SUPABASE_URL"];
  const service = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !service) throw new Error("Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return { url: url.replace(/\/$/, ""), service, anon: process.env["SUPABASE_ANON_KEY"] || service };
}

async function rest(path: string, init: RequestInit & { prefer?: string } = {}): Promise<Response> {
  const { url, service } = cfg();
  const { prefer, ...rest } = init;
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...rest,
    headers: { apikey: service, Authorization: `Bearer ${service}`, "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}), ...(rest.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} on ${path.split("?")[0]}: ${await res.text()}`);
  return res;
}

export const db = {
  async select<T>(path: string): Promise<T> { return (await rest(path)).json() as Promise<T>; },
  async insert(table: string, rows: unknown, prefer = "return=minimal"): Promise<void> { await rest(table, { method: "POST", body: JSON.stringify(rows), prefer }); },
  /** Inserts or updates and returns the written rows. */
  async upsert<T>(table: string, rows: unknown): Promise<T> { return (await rest(`${table}?on_conflict=id`, { method: "POST", body: JSON.stringify(rows), prefer: "resolution=merge-duplicates,return=representation" })).json() as Promise<T>; },
  /** Updates matching rows and returns them (empty list = nothing matched). */
  async patch<T>(path: string, body: unknown): Promise<T> { return (await rest(path, { method: "PATCH", body: JSON.stringify(body), prefer: "return=representation" })).json() as Promise<T>; },
  async remove(path: string): Promise<void> { await rest(path, { method: "DELETE" }); },
};

export type AuthSession = { access_token: string; refresh_token: string; expires_at: number; user: { id: string; email: string } };

async function gotrue<T>(path: string, init: RequestInit & { key?: "anon" | "service" } = {}): Promise<{ ok: boolean; status: number; body: T }> {
  const { url, service, anon } = cfg();
  const { key = "anon", ...rest } = init;
  const k = key === "service" ? service : anon;
  const res = await fetch(`${url}/auth/v1/${path}`, { ...rest, headers: { apikey: k, Authorization: `Bearer ${k}`, "Content-Type": "application/json" } });
  const body = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, body };
}

export async function passwordGrant(email: string, password: string): Promise<AuthSession> {
  const r = await gotrue<AuthSession>("token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
  if (!r.ok || !r.body.access_token) throw new AuthError("Wrong email or password.");
  return r.body;
}

export async function refreshGrant(refreshToken: string): Promise<AuthSession> {
  const r = await gotrue<AuthSession>("token?grant_type=refresh_token", { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) });
  if (!r.ok || !r.body.access_token) throw new AuthError("Your session ended. Please sign in again.", true);
  return r.body;
}

/** Verifies an access token with Supabase and returns who it belongs to. */
export async function authUser(token: string): Promise<{ id: string; email: string }> {
  const { url, anon } = cfg();
  if (typeof token !== "string" || token.length < 20 || token.length > 4000) throw new AuthError("Please sign in.", true);
  const res = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new AuthError("Your session ended. Please sign in again.", true);
  const u = (await res.json()) as { id?: string; email?: string };
  if (!isUuid(u.id)) throw new AuthError("Please sign in again.", true);
  return { id: u.id, email: u.email ?? "" };
}

export type Who = { id: string; email: string; role: "admin" | "editor" };

/** The ONE permission check. Every admin server function goes through here. */
export async function requireStaff(token: string, need: "editor" | "admin" = "editor"): Promise<Who> {
  const u = await authUser(token);
  const rows = await db.select<{ role: "admin" | "editor" }[]>(`fms_staff?user_id=eq.${u.id}&select=role&limit=1`);
  const role = rows[0]?.role;
  if (!role) throw new AuthError("This account doesn’t have admin access.", true);
  if (need === "admin" && role !== "admin") throw new AuthError("Only admins can do that.");
  return { id: u.id, email: u.email, role };
}

export async function staffRole(userId: string): Promise<"admin" | "editor" | null> {
  const rows = await db.select<{ role: "admin" | "editor" }[]>(`fms_staff?user_id=eq.${userId}&select=role&limit=1`);
  return rows[0]?.role ?? null;
}

export async function createUser(email: string, password: string): Promise<{ id: string }> {
  const r = await gotrue<{ id?: string; msg?: string; message?: string; error_code?: string }>("admin/users", { method: "POST", key: "service", body: JSON.stringify({ email, password, email_confirm: true }) });
  if (!r.ok || !isUuid(r.body.id)) {
    if (r.status === 422 || r.body.error_code === "email_exists") throw new Error("That email already has an account.");
    throw new Error(r.body.msg ?? r.body.message ?? "Couldn’t create the account.");
  }
  return { id: r.body.id };
}

export async function setUserPassword(userId: string, password: string): Promise<void> {
  const r = await gotrue<{ msg?: string }>(`admin/users/${userId}`, { method: "PUT", key: "service", body: JSON.stringify({ password }) });
  if (!r.ok) throw new Error(r.body.msg ?? "Couldn’t change the password.");
}

export async function deleteUser(userId: string): Promise<void> {
  await gotrue(`admin/users/${userId}`, { method: "DELETE", key: "service" });
}
