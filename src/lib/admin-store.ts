import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { articles, editions, leadership, partners, pressReleases, speakers, ticketTypes } from "@/content/site";

/** Public address used for share links. Change it if the site moves to a custom domain. */
export const LIVE_ORIGIN = "https://futuremediasummit.lovable.app";

export type Item = { id: string; published: boolean; updatedAt: number; [k: string]: string | number | boolean };
export type Field = {
  name: string;
  label: string;
  kind?: "text" | "textarea" | "long" | "date" | "datetime" | "select" | "toggle";
  options?: string[];
  wide?: boolean;
  slugFrom?: string;
  hint?: string;
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
  exportName: string;
  exportType: string;
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

export function slugify(t: string) {
  return t.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export const collections: Collection[] = [
  { key: "news", label: "News & stories", noun: "story", titleKey: "title", subKey: "category", listPath: "/news", exportName: "articles", exportType: "Article[]",
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
  { key: "summits", label: "Summits", noun: "summit edition", titleKey: "theme", subKey: "year", listPath: "/summits", exportName: "editions", exportType: "Summit[]",
    path: (i) => (s(i, "year") ? `/summits/${s(i, "year")}` : null),
    fields: [
      { name: "year", label: "Year" }, { name: "edition", label: "Edition (e.g. 3rd Edition)" },
      { name: "theme", label: "Theme", wide: true }, { name: "dateLabel", label: "Date" }, { name: "venue", label: "Venue" }, { name: "city", label: "City" },
      { name: "summary", label: "Summary", kind: "textarea", wide: true },
      { name: "registrationOpen", label: "Registration is open", kind: "toggle" },
      { name: "upcoming", label: "This is the NEXT summit (the homepage promotes it)", kind: "toggle" },
    ],
    toSite: (i) => ({ year: Number(s(i, "year")) || 0, edition: s(i, "edition"), theme: s(i, "theme"), dateLabel: s(i, "dateLabel"), venue: s(i, "venue"), city: s(i, "city"), registrationOpen: !!i.registrationOpen, ...opt("summary", s(i, "summary")), ...opt("startsAt", toIso(s(i, "startsAt"))), ...opt("endsAt", toIso(s(i, "endsAt"))), ...(i.upcoming ? { upcoming: true } : {}) }) },
  { key: "speakers", label: "Speakers", noun: "speaker", titleKey: "name", subKey: "organisation", listPath: "/speakers",
    path: (i) => (s(i, "slug") ? `/speakers/${s(i, "slug")}` : null), exportName: "speakers", exportType: "Speaker[]",
    fields: [
      { name: "name", label: "Name" }, { name: "slug", label: "Link name", slugFrom: "name" },
      { name: "title", label: "Job title" }, { name: "organisation", label: "Organisation" },
      { name: "role", label: "Role", kind: "select", options: ["Keynote", "Panellist", "Moderator", "Speaker"] },
      { name: "bio", label: "Bio", kind: "textarea", wide: true },
    ],
    toSite: (i) => ({ slug: s(i, "slug"), name: s(i, "name"), title: s(i, "title"), organisation: s(i, "organisation"), role: s(i, "role") || "Speaker", bio: s(i, "bio"), years: [] }) },
  { key: "partners", label: "Partners & sponsors", noun: "partner or sponsor", titleKey: "name", subKey: "category", listPath: "/partners", path: () => null, exportName: "partners", exportType: "Partner[]",
    fields: [
      { name: "name", label: "Name" }, { name: "kind", label: "Type", kind: "select", options: ["partner", "sponsor"] },
      { name: "category", label: "Category or tier" }, { name: "url", label: "Website" },
    ],
    toSite: (i) => ({ name: s(i, "name"), category: s(i, "category"), kind: s(i, "kind") || "partner", ...opt("url", s(i, "url")) }) },
  { key: "press", label: "Press releases", noun: "press release", titleKey: "title", subKey: "date", listPath: "/media/press-releases", path: () => null, exportName: "pressReleases", exportType: "PressRelease[]",
    fields: [{ name: "title", label: "Title", wide: true }, { name: "date", label: "Date", kind: "date" }, { name: "url", label: "Link to the full release" }],
    toSite: (i) => ({ title: s(i, "title"), date: s(i, "date"), ...opt("url", s(i, "url")) }) },
  { key: "team", label: "Leadership", noun: "team member", titleKey: "name", subKey: "title", listPath: "/about/leadership", path: () => null, exportName: "leadership", exportType: "Leader[]",
    fields: [{ name: "name", label: "Name" }, { name: "title", label: "Job title" }, { name: "bio", label: "Bio", kind: "textarea", wide: true }],
    toSite: (i) => ({ name: s(i, "name"), title: s(i, "title"), bio: s(i, "bio") }) },
  { key: "tickets", label: "Tickets", noun: "ticket type", titleKey: "name", subKey: "price", listPath: "/tickets", path: () => null, exportName: "ticketTypes", exportType: "TicketType[]",
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
    summits: editions.map((e) => ({ ...base(`s-${e.year}`, !e.draft), year: String(e.year), edition: e.edition, theme: e.theme, dateLabel: e.dateLabel, venue: e.venue, city: e.city, summary: e.summary ?? "", registrationOpen: e.registrationOpen, startsAt: toLocal(e.startsAt), endsAt: toLocal(e.endsAt), upcoming: !!e.upcoming })),
    speakers: speakers.map((x) => ({ ...base(`p-${x.slug}`, true), slug: x.slug, name: x.name, title: x.title, organisation: x.organisation, role: x.role, bio: x.bio })),
    partners: partners.map((p) => ({ ...base(`pa-${p.name}`, true), name: p.name, kind: p.kind, category: p.category, url: p.url ?? "" })),
    press: pressReleases.map((p) => ({ ...base(`pr-${p.title}`, true), title: p.title, date: p.date, url: p.url ?? "" })),
    team: leadership.map((l) => ({ ...base(`t-${l.name}`, true), name: l.name, title: l.title, bio: l.bio })),
    tickets: ticketTypes.map((t) => ({ ...base(`tk-${t.slug}`, !t.draft), slug: t.slug, name: t.name, price: t.price, blurb: t.blurb, perks: t.perks.join("\n") })),
  };
}

const KEY = "fms-admin-v1";

/** Edits live in this browser only (localStorage). The database replaces this later. */
export function useAdminStore() {
  const [data, setData] = useState<Data>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setData({ ...seed(), ...(JSON.parse(raw) as Partial<Data>) });
    } catch { /* storage unavailable or corrupt: start from the built-in content */ }
    setReady(true);
  }, []);

  const commit = useCallback((next: Data) => {
    setData(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const save = useCallback((key: CollectionKey, item: Item) => {
    const exists = data[key].some((x) => x.id === item.id);
    const stamped = { ...item, updatedAt: Date.now() };
    commit({ ...data, [key]: exists ? data[key].map((x) => (x.id === item.id ? stamped : x)) : [stamped, ...data[key]] });
  }, [data, commit]);

  const remove = useCallback((key: CollectionKey, id: string) => commit({ ...data, [key]: data[key].filter((x) => x.id !== id) }), [data, commit]);
  const reset = useCallback(() => { commit(seed()); }, [commit]);

  return { data, ready, save, remove, reset };
}

export function exportCode(c: Collection, items: Item[]) {
  const out = items.filter((i) => i.published).map(c.toSite);
  return `export const ${c.exportName}: ${c.exportType} = ${JSON.stringify(out, null, 2)};`;
}

export function copyText(text: string, msg = "Copied!") {
  navigator.clipboard?.writeText(text).then(() => toast.success(msg), () => toast.error("Couldn’t copy. Select the text and copy it by hand."));
}
