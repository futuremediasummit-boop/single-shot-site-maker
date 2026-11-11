import { editions, articles, leadership, partners, pressReleases, speakers, ticketTypes, stats, site, refreshDerived } from "@/content/site";
import { collections, type CollectionKey } from "@/lib/admin-store";
import { contentBackend, type PublishedContent } from "@/lib/content-backend";

export type LiveContent = PublishedContent;

const targets: Record<CollectionKey, unknown[]> = {
  news: articles, summits: editions, speakers, partners, press: pressReleases, team: leadership, tickets: ticketTypes,
};
let appliedAt = -1;

/** Pours published content into the lists and settings the public pages read from. */
export function applyLive(c: LiveContent | null | undefined) {
  if (!c || c.updatedAt === appliedAt) return;
  for (const col of collections) {
    const items = c.data?.[col.key];
    if (!Array.isArray(items)) continue;
    const out = items.filter((i) => i.published).map(col.toSite) as unknown[];
    targets[col.key].splice(0, targets[col.key].length, ...out);
  }
  const st = c.settings;
  if (st) {
    if (st.tagline.trim()) site.tagline = st.tagline.trim();
    site.contact.email = st.email.trim() || null;
    site.contact.phone = st.phone.trim() || null;
    site.contact.address = st.address.trim() || null;
    site.social.splice(0, site.social.length, ...st.social.filter((s) => s.label.trim() && s.url.trim()));
    stats.splice(0, stats.length, ...st.stats.filter((s) => s.label.trim() && s.value.trim()).map((s) => ({ label: s.label.trim(), value: Number(s.value.replace(/[^\d.]/g, "")) || 0, ...(s.suffix.trim() ? { suffix: s.suffix.trim() } : {}) })));
  }
  refreshDerived();
  appliedAt = c.updatedAt;
}

let cache: { at: number; value: LiveContent | null } | null = null;
export async function loadLiveContent(): Promise<LiveContent | null> {
  if (cache && Date.now() - cache.at < 60_000) return cache.value;
  const value = (await contentBackend.loadPublished()) ?? cache?.value ?? null;
  cache = { at: Date.now(), value };
  applyLive(value);
  return value;
}
