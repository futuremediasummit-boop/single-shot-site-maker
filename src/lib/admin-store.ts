import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { articles, editions, leadership, partners, pressReleases, site, speakers, stats as siteStats, ticketTypes } from "@/content/site";
import { adminLoad, adminPublish, adminRefresh, adminSaveDraft, adminSignIn, type Role, type Session } from "@/lib/admin-api";
import type { DraftContent, SiteSettings } from "@/lib/content-backend";

/** Public address used for share links. Change it if the site moves to a custom domain. */
export const LIVE_ORIGIN = "https://futuremediasummit.lovable.app";

export type Item = { id: string; published: boolean; updatedAt: number; [k: string]: string | number | boolean };
export type Field = {
  name: string;
  label: string;
  kind?: "text" | "textarea" | "long" | "date" | "datetime" | "select" | "toggle" | "pairs";
  options?: string[];
  wide?: boolean;
  slugFrom?: string;
  hint?: string;
  /** For kind "pairs": labels of the two columns. */
  pairLabels?: [string, string];
};
export type CollectionKey = "news" | "summits" | "speakers" | "partners" | "press" | "team" | "tickets";
export type Collection = {
  key: CollectionKey;
  label: string;
  noun: string;
  fields: Field[];
  titleKey: string;
  subKey: string;
  /** Public page for one item, or null when the item has no page of its own. */
  path: (i: Item) => string | null;
  listPath: string;
  toSite: (i: Item) => unknown;
};

const s = (i: Item, k: string) => String(i[k] ?? "").trim();
const paras = (t: string) => t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const lines = (t: string) => t.split("\n").map((p) => p.trim()).filter(Boolean);
const opt = (k: string, v: string) => (v ? { [k]: v } : {});
const pad = (n: number) => String(n).padStart(2, "0");
/** ISO instant -> value for a datetime-local input (admin's own time zone). */
const toLocal = (iso?: string) => { if (!iso) return ""; const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const toIso = (local: string) => { if (!local) return ""; const d = new Date(local); return Number.isNaN(d.getTime()) ? "" : d.toISOString(); };

export type Pair = { a: string; b: string };
/** "Pairs" fields are stored in an item as a JSON string so every item value stays simple text. */
export const decPairs = (v: unknown): Pair[] => { try { const j = JSON.parse(String(v ?? "[]")); return Array.isArray(j) ? j.map((x) => ({ a: String(x?.a ?? ""), b: String(x?.b ?? "") })) : []; } catch { return []; } };
export const encPairs = (rows: Pair[]) => JSON.stringify(rows);
const pairsOut = (v: unknown) => decPairs(v).filter((r) => r.a.trim() && r.b.trim());

export function slugify(t: string) {
  return t.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export const collections: Collection[] = [
  { key: "news", label: "News & stories", noun: "story", titleKey: "title", subKey: "category", listPath: "/news",
    path: (i) => (s(i, "slug") ? `/news/${s(i, "slug")}` : null),
    fields: [
      { name: "title", label: "Headline", wide: true },
      { name: "slug", label: "Link name", slugFrom: "title", hint: "Becomes the end of the story’s link" },
      { name: "category", label: "Category", kind: "select", options: ["Announcements", "Interviews", "Insights", "Summit updates", "Partners"] },
      { name: "date", label: "Date", kind: "date" },
      { name: "image", label: "Image link (optional)" },
      { name: "excerpt", label: "Short summary", kind: "textarea", wide: true },
      { name: "body", label: "Story", kind: "long", wide: true, hint: "Leave a blank line between paragraphs" },
    ],
    toSite: (i) => ({ slug: s(i, "slug"), title: s(i, "title"), category: s(i, "category"), date: s(i, "date"), excerpt: s(i, "excerpt"), body: paras(s(i, "body")), ...opt("image", s(i, "image")) }) },
  { key: "summits", label: "Summits", noun: "summit edition", titleKey: "theme", subKey: "year", listPath: "/summits",
    path: (i) => (s(i, "year") ? `/summits/${s(i, "year")}` : null),
    fields: [
      { name: "year", label: "Year" }, { name: "edition", label: "Edition (e.g. 3rd Edition)" },
      { name: "theme", label: "Theme", wide: true }, { name: "dateLabel", label: "Date" }, { name: "venue", label: "Venue" }, { name: "city", label: "City" },
      { name: "summary", label: "Summary", kind: "textarea", wide: true },
      { name: "startsAt", label: "Starts (drives the countdown)", kind: "datetime" }, { name: "endsAt", label: "Ends", kind: "datetime" },
      { name: "highlights", label: "Highlights", kind: "textarea", wide: true, hint: "One highlight per line. Shown on the summit’s page." },
      { name: "stats", label: "Numbers for this summit", kind: "pairs", wide: true, pairLabels: ["Label (e.g. Delegates)", "Number"] },
      { name: "registrationOpen", label: "Registration is open", kind: "toggle" },
      { name: "upcoming", label: "This is the NEXT summit (the homepage promotes it)", kind: "toggle" },
    ],
    toSite: (i) => ({ year: Number(s(i, "year")) || 0, edition: s(i, "edition"), theme: s(i, "theme"), dateLabel: s(i, "dateLabel"), venue: s(i, "venue"), city: s(i, "city"), registrationOpen: !!i.registrationOpen, ...opt("summary", s(i, "summary")), ...(lines(s(i, "highlights")).length ? { highlights: lines(s(i, "highlights")) } : {}), ...(pairsOut(i.stats).length ? { stats: pairsOut(i.stats).map((r) => ({ label: r.a.trim(), value: r.b.trim() })) } : {}), ...opt("startsAt", toIso(s(i, "startsAt"))), ...opt("endsAt", toIso(s(i, "endsAt"))), ...(i.upcoming ? { upcoming: true } : {}) }) },
  { key: "speakers", label: "Speakers", noun: "speaker", titleKey: "name", subKey: "organisation", listPath: "/speakers",
    path: (i) => (s(i, "slug") ? `/speakers/${s(i, "slug")}` : null),fields: [
      { name: "name", label: "Name" }, { name: "slug", label: "Link name", slugFrom: "name" },
      { name: "title", label: "Job title" }, { name: "organisation", label: "Organisation" },
      { name: "role", label: "Role", kind: "select", options: ["Keynote", "Panellist", "Moderator", "Speaker"] },
      { name: "photo", label: "Photo link (optional)" },
      { name: "bio", label: "Bio", kind: "textarea", wide: true },
    ],
    toSite: (i) => ({ slug: s(i, "slug"), name: s(i, "name"), title: s(i, "title"), organisation: s(i, "organisation"), role: s(i, "role") || "Speaker", bio: s(i, "bio"), years: [], ...opt("photo", s(i, "photo")) }) },
  { key: "partners", label: "Partners & sponsors", noun: "partner or sponsor", titleKey: "name", subKey: "category", listPath: "/partners", path: () => null,
    fields: [
      { name: "name", label: "Name" }, { name: "kind", label: "Type", kind: "select", options: ["partner", "sponsor"] },
      { name: "category", label: "Category or tier" }, { name: "url", label: "Website" }, { name: "logo", label: "Logo link (optional)" },
    ],
    toSite: (i) => ({ name: s(i, "name"), category: s(i, "category"), kind: s(i, "kind") || "partner", ...opt("url", s(i, "url")), ...opt("logo", s(i, "logo")) }) },
  { key: "press", label: "Press releases", noun: "press release", titleKey: "title", subKey: "date", listPath: "/media/press-releases", path: () => null,
    fields: [{ name: "title", label: "Title", wide: true }, { name: "date", label: "Date", kind: "date" }, { name: "url", label: "Link to the full release" }],
    toSite: (i) => ({ title: s(i, "title"), date: s(i, "date"), ...opt("url", s(i, "url")) }) },
  { key: "team", label: "Leadership", noun: "team member", titleKey: "name", subKey: "title", listPath: "/about/leadership", path: () => null,
    fields: [{ name: "name", label: "Name" }, { name: "title", label: "Job title" }, { name: "photo", label: "Photo link (optional)" }, { name: "bio", label: "Bio", kind: "textarea", wide: true }],
    toSite: (i) => ({ name: s(i, "name"), title: s(i, "title"), bio: s(i, "bio"), ...opt("photo", s(i, "photo")) }) },
  { key: "tickets", label: "Tickets", noun: "ticket type", titleKey: "name", subKey: "price", listPath: "/tickets", path: () => null,
    fields: [
      { name: "name", label: "Name" }, { name: "slug", label: "Link name", slugFrom: "name" }, { name: "price", label: "Price (e.g. KES 5,000)" },
      { name: "blurb", label: "Short description", kind: "textarea", wide: true },
      { name: "perks", label: "What’s included", kind: "textarea", wide: true, hint: "One per line" },
    ],
    toSite: (i) => ({ slug: s(i, "slug"), name: s(i, "name"), blurb: s(i, "blurb"), price: s(i, "price") || "TBA", perks: lines(s(i, "perks")) }) },
];

export const getCollection = (k: CollectionKey) => collections.find((c) => c.key === k)!;
export const shareUrl = (path: string) => `${LIVE_ORIGIN}${path}`;

export type Data = Record<CollectionKey, Item[]>;

function seed(): Data {
  const base = (id: string, published: boolean) => ({ id, published, updatedAt: 0 });
  return {
    news: articles.map((a) => ({ ...base(`n-${a.slug}`, true), slug: a.slug, title: a.title, category: a.category, date: a.date, excerpt: a.excerpt, body: a.body.join("\n\n"), image: a.image ?? "" })),
    summits: editions.map((e) => ({ ...base(`s-${e.year}`, !e.draft), year: String(e.year), edition: e.edition, theme: e.theme, dateLabel: e.dateLabel, venue: e.venue, city: e.city, summary: e.summary ?? "", highlights: (e.highlights ?? []).join("\n"), stats: encPairs((e.stats ?? []).map((x) => ({ a: x.label, b: x.value }))), registrationOpen: e.registrationOpen, startsAt: toLocal(e.startsAt), endsAt: toLocal(e.endsAt), upcoming: !!e.upcoming })),
    speakers: speakers.map((x) => ({ ...base(`p-${x.slug}`, true), slug: x.slug, name: x.name, title: x.title, organisation: x.organisation, role: x.role, bio: x.bio, photo: x.photo ?? "" })),
    partners: partners.map((p) => ({ ...base(`pa-${p.name}`, true), name: p.name, kind: p.kind, category: p.category, url: p.url ?? "", logo: p.logo ?? "" })),
    press: pressReleases.map((p) => ({ ...base(`pr-${p.title}`, true), title: p.title, date: p.date, url: p.url ?? "" })),
    team: leadership.map((l) => ({ ...base(`t-${l.name}`, true), name: l.name, title: l.title, bio: l.bio, photo: l.photo ?? "" })),
    tickets: ticketTypes.map((t) => ({ ...base(`tk-${t.slug}`, !t.draft), slug: t.slug, name: t.name, price: t.price, blurb: t.blurb, perks: t.perks.join("\n") })),
  };
}

export const seedSettings = (): SiteSettings => ({
  tagline: site.tagline,
  email: site.contact.email ?? "", phone: site.contact.phone ?? "", address: site.contact.address ?? "",
  social: site.social.map((x) => ({ ...x })),
  stats: siteStats.map((x) => ({ label: x.label, value: String(x.value), suffix: x.suffix ?? "" })),
});

/* ── Sign-in session (kept in this browser; every request is re-checked on the server) ── */

const SESSION_KEY = "fms-admin-session-v1";

export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);
  const ref = useRef<Session | null>(null);
  const refreshing = useRef<Promise<string> | null>(null);

  const keep = useCallback((s: Session | null) => {
    ref.current = s; setSession(s);
    try { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { const raw = localStorage.getItem(SESSION_KEY); if (raw) { const j = JSON.parse(raw) as Session; if (j?.accessToken && j?.refreshToken) { ref.current = j; setSession(j); } } } catch { /* ignore */ }
    setChecked(true);
  }, []);

  /** Returns an error message, or null on success. */
  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const r = await adminSignIn({ data: { email, password } });
      if (r.ok) { keep(r.session); return null; }
      return r.error;
    } catch { return "Couldn’t reach the server. Check your connection and try again."; }
  }, [keep]);

  const signOut = useCallback(() => keep(null), [keep]);

  /** A valid access token, refreshing it quietly when it is about to expire. */
  const getToken = useCallback(async (): Promise<string> => {
    const s = ref.current;
    if (!s) throw new Error("Not signed in.");
    if (s.expiresAt * 1000 - Date.now() > 60_000) return s.accessToken;
    if (!refreshing.current) {
      refreshing.current = (async () => {
        try {
          const r = await adminRefresh({ data: { refreshToken: s.refreshToken } });
          if (!r.ok) { keep(null); throw new Error(r.error); }
          keep(r.session); return r.session.accessToken;
        } finally { refreshing.current = null; }
      })();
    }
    return refreshing.current;
  }, [keep]);

  return { session, checked, signIn, signOut, getToken };
}
export type AdminAuth = ReturnType<typeof useAdminSession>;

/* ── Draft + publish (all stored in Supabase) ── */

type Draft = DraftContent & { data: Data };
type SaveState = "saved" | "saving" | "error" | "conflict";

/** Same JSON no matter how the database orders object keys. */
function canon(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canon).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v as object).filter((k) => k !== "updatedAt").sort().map((k) => `${JSON.stringify(k)}:${canon((v as Record<string, unknown>)[k])}`).join(",")}}`;
  return JSON.stringify(v) ?? "null";
}
/** What the public would see: only Published items, plus settings. Used to tell whether there is anything to publish. */
const liveView = (data: Partial<Record<CollectionKey, Item[]>>, settings: SiteSettings | undefined) =>
  canon({ data: Object.fromEntries(collections.map((c) => [c.key, (data[c.key] ?? []).filter((i) => i.published)])), settings: settings ?? null });

/**
 * Your edits save to Supabase automatically as you type (the "Saved" label). Publish copies the saved
 * draft to the live copy that the public site reads. Nothing is stored in the browser except the sign-in.
 */
export function useAdminStore(auth: AdminAuth) {
  const { getToken, signOut } = auth;
  const [data, setData] = useState<Data>(seed);
  const [settings, setSettings] = useState<SiteSettings>(seedSettings);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [publishedSnap, setPublishedSnap] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const latest = useRef<Draft>({ data: seed(), settings: seedSettings() });
  const version = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const state = useRef<SaveState>("saved");
  const mark = useCallback((s: SaveState) => { state.current = s; setSaveState(s); }, []);

  const load = useCallback(async () => {
    setReady(false); setLoadError("");
    try {
      const token = await getToken();
      const r = await adminLoad({ data: { token } });
      if (!r.ok) { if (r.auth) signOut(); setLoadError(r.error); return; }
      const base = { data: seed(), settings: seedSettings() };
      const live = r.published;
      const start: Draft = r.draft
        ? { data: { ...base.data, ...r.draft.content.data } as Data, settings: { ...base.settings, ...r.draft.content.settings } }
        : live ? { data: { ...base.data, ...live.data } as Data, settings: { ...base.settings, ...(live.settings ?? {}) } } : base;
      version.current = r.draft?.version ?? 0;
      latest.current = start; setData(start.data); setSettings(start.settings);
      setRole(r.role);
      setPublishedSnap(live ? liveView(live.data, live.settings) : null);
      setPublishedAt(live?.updatedAt ?? null);
      mark("saved");
      setReady(true);
    } catch (e) { setLoadError(e instanceof Error ? e.message : "Couldn’t load the admin."); }
  }, [getToken, signOut, mark]);

  useEffect(() => { void load(); }, [load]);

  const persistNow = useCallback(async () => {
    mark("saving");
    try {
      const token = await getToken();
      const r = await adminSaveDraft({ data: { token, content: latest.current, expectedVersion: version.current } });
      if (r.ok) { version.current = r.version; mark(timer.current ? "saving" : "saved"); }
      else if (r.conflict) mark("conflict");
      else { if (r.auth) signOut(); mark("error"); }
    } catch { mark("error"); }
  }, [getToken, signOut, mark]);

  const schedule = useCallback(() => {
    mark("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { timer.current = null; queue.current = queue.current.then(persistNow); }, 700);
  }, [persistNow, mark]);

  const flush = useCallback(async () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; queue.current = queue.current.then(persistNow); }
    await queue.current;
  }, [persistNow]);

  const commit = useCallback((d: Data, st: SiteSettings) => {
    latest.current = { data: d, settings: st };
    setData(d); setSettings(st); schedule();
  }, [schedule]);

  const save = useCallback((key: CollectionKey, item: Item) => {
    const cur = latest.current.data;
    const exists = cur[key].some((x) => x.id === item.id);
    const stamped = { ...item, updatedAt: Date.now() };
    commit({ ...cur, [key]: exists ? cur[key].map((x) => (x.id === item.id ? stamped : x)) : [stamped, ...cur[key]] }, latest.current.settings);
  }, [commit]);

  const remove = useCallback((key: CollectionKey, id: string) => {
    const cur = latest.current.data;
    commit({ ...cur, [key]: cur[key].filter((x) => x.id !== id) }, latest.current.settings);
  }, [commit]);

  const saveSettings = useCallback((st: SiteSettings) => commit(latest.current.data, st), [commit]);

  const dirty = ready && liveView(data, settings) !== publishedSnap;

  /** Puts everything marked Published on the live site. Throws a readable Error on failure. */
  const publish = useCallback(async () => {
    setPublishing(true);
    try {
      await flush();
      if (state.current === "conflict") throw new Error("Someone else changed the draft. Reload the page, then publish again.");
      if (state.current === "error") throw new Error("Your latest edits didn’t save. Check your connection and try again.");
      const token = await getToken();
      const r = await adminPublish({ data: { token } });
      if (!r.ok) { if (r.auth) signOut(); throw new Error(r.error); }
      setPublishedSnap(liveView(latest.current.data, latest.current.settings)); setPublishedAt(r.updatedAt);
      return r.updatedAt;
    } finally { setPublishing(false); }
  }, [flush, getToken, signOut]);

  return { data, settings, ready, loadError, role, save, remove, saveSettings, publish, publishing, dirty, publishedAt, saveState, reload: load };
}

export function copyText(text: string, msg = "Copied!") {
  navigator.clipboard?.writeText(text).then(() => toast.success(msg), () => toast.error("Couldn’t copy. Select the text and copy it by hand."));
}
