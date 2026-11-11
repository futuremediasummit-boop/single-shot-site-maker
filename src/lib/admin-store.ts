import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { articles, editions, leadership, partners, pressReleases, site, speakers, stats as siteStats, ticketTypes } from "@/content/site";
import { contentBackend, type PublishedContent, type SiteSettings } from "@/lib/content-backend";

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

const KEY = "fms-admin-v2";
type Draft = { data: Data; settings: SiteSettings };
const snapshot = (d: Draft) => JSON.stringify({ data: d.data, settings: d.settings, }, (k, v) => (k === "updatedAt" ? undefined : v));

/**
 * Edits are saved as a DRAFT in this browser as you type. Nothing reaches the public site
 * until Publish is pressed, which hands everything to the content backend (see content-backend.ts).
 */
export function useAdminStore() {
  const [data, setData] = useState<Data>(seed);
  const [settings, setSettings] = useState<SiteSettings>(seedSettings);
  const [ready, setReady] = useState(false);
  const [publishedSnap, setPublishedSnap] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      let draft: Draft = { data: seed(), settings: seedSettings() };
      let hasDraft = false;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) { const j = JSON.parse(raw) as Partial<Draft>; draft = { data: { ...draft.data, ...(j.data ?? {}) }, settings: { ...draft.settings, ...(j.settings ?? {}) } }; hasDraft = true; }
      } catch { /* storage unavailable or corrupt: start from the built-in content */ }
      const live = await contentBackend.loadPublished().catch(() => null);
      if (!alive) return;
      if (live) {
        const liveDraft: Draft = { data: { ...seed(), ...live.data } as Data, settings: { ...seedSettings(), ...(live.settings ?? {}) } };
        setPublishedSnap(snapshot(liveDraft)); setPublishedAt(live.updatedAt);
        if (!hasDraft) draft = liveDraft;
      }
      setData(draft.data); setSettings(draft.settings); setReady(true);
    })();
    return () => { alive = false; };
  }, []);

  const persist = useCallback((d: Data, st: SiteSettings) => {
    try { localStorage.setItem(KEY, JSON.stringify({ data: d, settings: st })); } catch { /* ignore */ }
  }, []);

  const save = useCallback((key: CollectionKey, item: Item) => {
    const exists = data[key].some((x) => x.id === item.id);
    const stamped = { ...item, updatedAt: Date.now() };
    const next = { ...data, [key]: exists ? data[key].map((x) => (x.id === item.id ? stamped : x)) : [stamped, ...data[key]] };
    setData(next); persist(next, settings);
  }, [data, settings, persist]);

  const remove = useCallback((key: CollectionKey, id: string) => {
    const next = { ...data, [key]: data[key].filter((x) => x.id !== id) };
    setData(next); persist(next, settings);
  }, [data, settings, persist]);

  const saveSettings = useCallback((st: SiteSettings) => { setSettings(st); persist(data, st); }, [data, persist]);

  const dirty = ready && snapshot({ data, settings }) !== publishedSnap;

  /** Puts everything marked Published on the live site. Throws a readable Error on failure. */
  const publish = useCallback(async () => {
    setPublishing(true);
    try {
      const content: Omit<PublishedContent, "v" | "updatedAt"> = { data, settings };
      const at = await contentBackend.publish(content);
      setPublishedSnap(snapshot({ data, settings })); setPublishedAt(at);
      return at;
    } finally { setPublishing(false); }
  }, [data, settings]);

  return { data, settings, ready, save, remove, saveSettings, publish, publishing, dirty, publishedAt };
}

export function copyText(text: string, msg = "Copied!") {
  navigator.clipboard?.writeText(text).then(() => toast.success(msg), () => toast.error("Couldn’t copy. Select the text and copy it by hand."));
}
