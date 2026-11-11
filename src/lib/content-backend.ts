import type { CollectionKey, Item } from "@/lib/admin-store";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONTENT BACKEND: the ONE file to change when Supabase is ready.
 * ─────────────────────────────────────────────────────────────────────────────
 *  The admin and the public site only talk to `contentBackend` below. Nothing
 *  else in the app knows where content is stored.
 *
 *  RIGHT NOW (no database): drafts and "published" content are both kept in this
 *  browser's localStorage. The Publish button works and the admin can see its own
 *  published result, but OTHER visitors will not see it until the Supabase
 *  version below is switched on.
 *
 *  WHEN SUPABASE IS READY: implement `supabaseBackend` (sketch included) and
 *  change the last line to `export const contentBackend = supabaseBackend;`.
 *  No admin or page code needs to change.
 */

export type SiteSettings = {
  tagline: string;
  email: string;
  phone: string;
  address: string;
  social: { label: string; url: string }[];
  /** Homepage numbers, e.g. { label: "Delegates", value: "500", suffix: "+" } */
  stats: { label: string; value: string; suffix: string }[];
};

export type PublishedContent = {
  v: 1;
  updatedAt: number;
  data: Partial<Record<CollectionKey, Item[]>>;
  settings?: SiteSettings;
};

export interface ContentBackend {
  /** Latest published content, or null when nothing has been published yet. Used by the public site. */
  loadPublished(): Promise<PublishedContent | null>;
  /** Make this content live. Returns the time it was published. Called by the Publish button. */
  publish(content: Omit<PublishedContent, "v" | "updatedAt">): Promise<number>;
}

/* ── Temporary: browser-only storage ─────────────────────────────────────── */
const PUBLISHED_KEY = "fms-published-v1";

const localBackend: ContentBackend = {
  async loadPublished() {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(PUBLISHED_KEY);
      const j = raw ? (JSON.parse(raw) as PublishedContent) : null;
      return j && j.v === 1 && j.data ? j : null;
    } catch { return null; }
  },
  async publish(content) {
    const updatedAt = Date.now();
    const value: PublishedContent = { v: 1, updatedAt, ...content };
    try { window.localStorage.setItem(PUBLISHED_KEY, JSON.stringify(value)); }
    catch { throw new Error("Couldn’t save. Browser storage is full or blocked."); }
    return updatedAt;
  },
};

/* ── Supabase sketch (fill in later) ─────────────────────────────────────────
 *  Suggested table:  site_content ( id text primary key default 'main', content jsonb not null, updated_at timestamptz default now() )
 *    - public (anon) role: SELECT only
 *    - publish: only a signed-in admin may INSERT/UPDATE (row-level security)
 *
 *  const supabaseBackend: ContentBackend = {
 *    async loadPublished() {
 *      const { data } = await supabase.from("site_content").select("content, updated_at").eq("id", "main").maybeSingle();
 *      return data ? { ...(data.content as PublishedContent), updatedAt: Date.parse(data.updated_at) } : null;
 *    },
 *    async publish(content) {
 *      const updatedAt = Date.now();
 *      const { error } = await supabase.from("site_content").upsert({ id: "main", content: { v: 1, updatedAt, ...content }, updated_at: new Date(updatedAt).toISOString() });
 *      if (error) throw new Error(error.message);
 *      return updatedAt;
 *    },
 *  };
 *
 *  Images: use Supabase Storage and paste the public URL into the photo/logo/image fields
 *  (or add an upload button that does this for the admin).
 */

export const contentBackend: ContentBackend = localBackend;
