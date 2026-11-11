import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@/lib/content-backend";
import { PairsEditor } from "./AdminParts";

/** Site-wide details: tagline, contact info, social links and the homepage numbers. */
export function SettingsEditor({ settings, onSave }: { settings: SiteSettings; onSave: (s: SiteSettings) => void }) {
  const [v, setV] = useState<SiteSettings>(settings);
  const set = <K extends keyof SiteSettings>(k: K, val: SiteSettings[K]) => setV((c) => ({ ...c, [k]: val }));
  const box = "rounded-3xl border bg-card p-6 shadow-card";
  return (
    <div className="animate-pop space-y-6">
      <div><h1 className="text-3xl font-extrabold">Site settings</h1><p className="mt-1 text-sm text-muted-foreground">Details that appear across the whole website. Remember to press Publish after saving.</p></div>

      <section className={box}>
        <h2 className="text-xl font-bold">Tagline</h2>
        <Textarea className="mt-3" rows={2} maxLength={300} value={v.tagline} onChange={(e) => set("tagline", e.target.value)} aria-label="Tagline" />
      </section>

      <section className={box}>
        <h2 className="text-xl font-bold">Contact details</h2>
        <p className="text-sm text-muted-foreground">Leave a box empty to show “To be announced”.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(["email", "phone", "address"] as const).map((k) => (
            <div key={k} className={k === "address" ? "sm:col-span-2" : ""}>
              <Label htmlFor={`st-${k}`} className="mb-2 block text-sm font-bold capitalize">{k}</Label>
              <Input id={`st-${k}`} maxLength={200} value={v[k]} onChange={(e) => set(k, e.target.value)} />
            </div>
          ))}
        </div>
      </section>

      <section className={box}>
        <h2 className="text-xl font-bold">Social media links</h2>
        <p className="mb-4 text-sm text-muted-foreground">Shown in the website footer.</p>
        <PairsEditor labels={["Name (e.g. LinkedIn)", "Link (https://…)"]} addLabel="Add a link" rows={v.social.map((x) => ({ a: x.label, b: x.url }))} onChange={(r) => set("social", r.map((x) => ({ label: x.a, url: x.b })))} />
      </section>

      <section className={box}>
        <h2 className="text-xl font-bold">Homepage numbers</h2>
        <p className="mb-4 text-sm text-muted-foreground">Big figures such as “Delegates 500+”. Leave empty to hide the strip.</p>
        <div className="space-y-2">
          {v.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_80px_auto] items-center gap-2">
              <Input placeholder="Label" aria-label="Label" maxLength={80} value={s.label} onChange={(e) => set("stats", v.stats.map((x, n) => (n === i ? { ...x, label: e.target.value } : x)))} />
              <Input placeholder="Number" aria-label="Number" inputMode="numeric" maxLength={12} value={s.value} onChange={(e) => set("stats", v.stats.map((x, n) => (n === i ? { ...x, value: e.target.value } : x)))} />
              <Input placeholder="+" aria-label="Suffix" maxLength={4} value={s.suffix} onChange={(e) => set("stats", v.stats.map((x, n) => (n === i ? { ...x, suffix: e.target.value } : x)))} />
              <Button type="button" size="sm" variant="ghost" onClick={() => set("stats", v.stats.filter((_, n) => n !== i))}>Remove</Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => set("stats", [...v.stats, { label: "", value: "", suffix: "" }])}>Add a number</Button>
        </div>
      </section>

      <Button size="lg" onClick={() => { onSave(v); toast.success("Settings saved. Press Publish to put them live."); }}><Check /> Save settings</Button>
    </div>
  );
}
