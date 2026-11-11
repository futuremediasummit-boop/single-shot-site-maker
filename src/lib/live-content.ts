import { editions, articles, leadership, partners, pressReleases, speakers, ticketTypes, refreshDerived } from "@/content/site";
import { collections, type CollectionKey, type Item } from "@/lib/admin-store";
import { CONTENT_BRANCH, CONTENT_PATH, CONTENT_REPO } from "@/lib/live-config";

export type LiveContent = { v: 1; updatedAt: number; data: Partial<Record<CollectionKey, Item[]>> };

const targets: Record<CollectionKey, unknown[]> = {
  news: articles, summits: editions, speakers, partners, press: pressReleases, team: leadership, tickets: ticketTypes,
};
const builtinEditions = [...editions];
let appliedAt = -1;

export function applyLive(c: LiveContent | null | undefined) {
  if (!c || c.updatedAt === appliedAt) return;
  for (const col of collections) {
    const items = c.data?.[col.key];
    if (!Array.isArray(items)) continue;
    let out = items.filter((i) => i.published).map(col.toSite) as unknown[];
    if (col.key === "summits") {
      out = (out as { year: number }[]).map((e) => {
        const old = builtinEditions.find((b) => b.year === e.year);
        return { ...(old ? { highlights: old.highlights, stats: old.stats } : {}), ...e };
      });
    }
    targets[col.key].splice(0, targets[col.key].length, ...out);
  }
  refreshDerived();
  appliedAt = c.updatedAt;
}

export async function fetchLive(): Promise<LiveContent | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 3000);
    const url = `https://raw.githubusercontent.com/${CONTENT_REPO}/${CONTENT_BRANCH}/${CONTENT_PATH}?t=${Math.floor(Date.now() / 60000)}`;
    const res = await fetch(url, { signal: ctl.signal, cache: "no-store" });
    clearTimeout(t);
    if (!res.ok) return null;
    const j = (await res.json()) as LiveContent;
    return j && j.v === 1 && j.data ? j : null;
  } catch { return null; }
}

let cache: { at: number; value: LiveContent | null } | null = null;
export async function loadLiveContent(): Promise<LiveContent | null> {
  if (cache && Date.now() - cache.at < 60_000) return cache.value;
  const value = (await fetchLive()) ?? cache?.value ?? null;
  cache = { at: Date.now(), value };
  applyLive(value);
  return value;
}

export async function publishToGithub(token: string, data: Partial<Record<CollectionKey, Item[]>>) {
  const api = `https://api.github.com/repos/${CONTENT_REPO}/contents/${CONTENT_PATH}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  let sha: string | undefined;
  const cur = await fetch(`${api}?ref=${CONTENT_BRANCH}`, { headers });
  if (cur.ok) sha = ((await cur.json()) as { sha: string }).sha;
  else if (cur.status === 401) throw new Error("GitHub rejected the token. Make a new one.");
  else if (cur.status !== 404) throw new Error(`GitHub error ${cur.status}. Check the token has access to ${CONTENT_REPO}.`);
  const updatedAt = Date.now();
  const bytes = new TextEncoder().encode(JSON.stringify({ v: 1, updatedAt, data }));
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  const res = await fetch(api, {
    method: "PUT", headers,
    body: JSON.stringify({ message: `Publish from admin (${new Date(updatedAt).toISOString()})`, content: btoa(bin), branch: CONTENT_BRANCH, ...(sha ? { sha } : {}) }),
  });
  if (!res.ok) throw new Error(res.status === 403 || res.status === 404 ? `No write access to ${CONTENT_REPO}. Token needs Contents: Read and write.` : `GitHub error ${res.status}.`);
  return updatedAt;
}
