import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Link2, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { copyText, slugify, shareUrl, type Collection, type Item } from "@/lib/admin-store";

/** The item’s own link, with copy, open and share buttons. */
export function ShareBox({ item, col }: { item: Item; col: Collection }) {
  const path = col.path(item);
  if (!path) return <p className="text-xs text-muted-foreground">This item shows on the <a className="font-bold text-blue hover:underline" href={col.listPath} target="_blank" rel="noopener noreferrer">{col.label} page</a>, so it has no link of its own.</p>;
  const url = shareUrl(path);
  const title = String(item[col.titleKey] ?? "");
  const e = encodeURIComponent;
  const btn = "inline-flex h-8 items-center gap-1.5 rounded-full border bg-card px-3 text-xs font-bold transition hover:-translate-y-0.5 hover:border-blue hover:text-blue";
  return (
    <div className="rounded-2xl bg-mist/70 p-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 shrink-0 text-blue" />
        <code className="min-w-0 flex-1 truncate text-xs" title={url}>{url}</code>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => copyText(url, "Link copied!")}><Copy className="h-3.5 w-3.5" />Copy link</button>
        <a className={btn} href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" />Open</a>
        <a className={btn} href={`https://wa.me/?text=${e(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>
        <a className={btn} href={`https://twitter.com/intent/tweet?url=${e(url)}&text=${e(title)}`} target="_blank" rel="noopener noreferrer">X</a>
        <a className={btn} href={`https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a className={btn} href={`mailto:?subject=${e(title)}&body=${e(url)}`}><Mail className="h-3.5 w-3.5" />Email</a>
      </div>
      {!item.published && <p className="mt-3 text-xs font-medium text-navy/70">Draft: this link shows “not found” until the story is published to the website (see the Publish tab).</p>}
    </div>
  );
}

function StoryPreview({ item }: { item: Item }) {
  const paras = String(item.body ?? "").split(/\n\s*\n/).filter((p) => p.trim());
  return (
    <div className="overflow-hidden rounded-3xl border bg-background shadow-card">
      <div className="surface-navy relative p-6">
        <div className="blob -right-10 -top-10 h-32 w-32 bg-blue/40" />
        <p className="eyebrow relative text-gold">{String(item.category || "Category")} · {String(item.date || "Date")}</p>
        <h3 className="relative mt-3 text-2xl font-bold leading-tight">{String(item.title || "Your headline appears here")}</h3>
        {item.excerpt ? <p className="relative mt-3 text-sm text-navy-foreground/70">{String(item.excerpt)}</p> : null}
      </div>
      <div className="space-y-3 p-6 text-sm leading-relaxed">
        {paras.length ? paras.map((p, i) => <p key={i}>{p}</p>) : <p className="text-muted-foreground">Start writing and your story shows up here, laid out like the real page.</p>}
      </div>
    </div>
  );
}

export function ItemEditor({ col, item, existing, open, onClose, onSave }: {
  col: Collection; item: Item; existing: Item[]; open: boolean; onClose: () => void; onSave: (i: Item) => void;
}) {
  const isNew = item.updatedAt === 0 && !existing.some((x) => x.id === item.id);
  const [v, setV] = useState<Item>(item);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [error, setError] = useState("");

  const set = (name: string, value: string | boolean) => {
    setError("");
    setV((cur) => {
      const next: Item = { ...cur, [name]: value };
      if (isNew && !slugTouched) {
        const sf = col.fields.find((f) => f.slugFrom === name);
        if (sf && typeof value === "string") next[sf.name] = slugify(value);
      }
      return next;
    });
  };

  const slugField = col.fields.find((f) => f.slugFrom);
  const problem = useMemo(() => {
    if (!String(v[col.titleKey] ?? "").trim()) return `Please fill in the ${col.fields.find((f) => f.name === col.titleKey)?.label.toLowerCase() ?? "title"}.`;
    if (slugField) {
      const sl = String(v[slugField.name] ?? "");
      if (!sl) return "The link name can’t be empty.";
      if (existing.some((x) => x.id !== v.id && x[slugField.name] === sl)) return "Another item already uses that link name. Pick a different one.";
    }
    return "";
  }, [v, col, existing, slugField]);

  const submit = (publish: boolean) => {
    if (problem) { setError(problem); return; }
    onSave({ ...v, published: publish });
    toast.success(publish ? "Saved and marked Published." : "Saved as draft.");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isNew ? `New ${col.noun}` : `Edit ${col.noun}`}</DialogTitle>
          <DialogDescription>Changes are saved in this browser. Use the Publish tab to put them on the live website.</DialogDescription>
        </DialogHeader>
        <div className={col.key === "news" ? "grid gap-8 lg:grid-cols-[1.1fr_1fr]" : ""}>
          <div className="grid content-start gap-4 sm:grid-cols-2">
            {col.fields.map((f) => {
              const id = `f-${col.key}-${f.name}`;
              const val = v[f.name];
              return (
                <div key={f.name} className={f.wide || f.kind === "textarea" || f.kind === "long" ? "sm:col-span-2" : ""}>
                  {f.kind === "toggle" ? (
                    <div className="flex items-center gap-3 rounded-2xl bg-mist/70 p-3"><Switch id={id} checked={!!val} onCheckedChange={(c) => set(f.name, c)} /><Label htmlFor={id} className="font-bold">{f.label}</Label></div>
                  ) : (
                    <>
                      <Label htmlFor={id} className="mb-2 block text-sm font-bold">{f.label}</Label>
                      {f.kind === "textarea" || f.kind === "long" ? (
                        <Textarea id={id} rows={f.kind === "long" ? 12 : 3} maxLength={f.kind === "long" ? 20000 : 1500} value={String(val ?? "")} onChange={(e) => set(f.name, e.target.value)} />
                      ) : f.kind === "select" ? (
                        <select id={id} value={String(val ?? "")} onChange={(e) => set(f.name, e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                          <option value="">Select…</option>
                          {f.options?.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <Input id={id} type={f.kind === "date" ? "date" : "text"} maxLength={300} value={String(val ?? "")} onChange={(e) => { if (f.slugFrom) { setSlugTouched(true); set(f.name, slugify(e.target.value)); } else set(f.name, e.target.value); }} />
                      )}
                      {f.hint && <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>}
                    </>
                  )}
                </div>
              );
            })}
            {col.path(v) && (
              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-bold">This {col.noun}’s link</p>
                <ShareBox item={v} col={col} />
              </div>
            )}
          </div>
          {col.key === "news" && <div className="lg:sticky lg:top-0 lg:self-start"><p className="mb-2 text-sm font-bold">Live preview</p><StoryPreview item={v} /></div>}
        </div>
        {error && <p role="alert" className="rounded-2xl bg-destructive/10 p-3 text-sm font-bold text-destructive">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="outline" onClick={() => submit(false)}>Save as draft</Button>
          <Button type="button" onClick={() => submit(true)}><Check /> Save &amp; publish</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
