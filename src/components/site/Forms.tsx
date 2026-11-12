import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitForm } from "@/lib/admin-api";

export type Field = { name: string; label: string; type?: "text" | "email" | "tel" | "textarea" | "select"; options?: string[]; required?: boolean; full?: boolean };

const Honeypot = () => (
  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
    <label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
  </div>
);

/** Generic enquiry form. Submissions are saved to the Supabase inbox that admins read. */
export function EnquiryForm({ fields, submitLabel, kind }: { fields: Field[]; submitLabel: string; kind: "contact" | "partner" | "accreditation" }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const payload: Record<string, string> = {};
    fields.forEach((x) => { payload[x.name] = String(f.get(x.name) ?? "").trim(); });
    setBusy(true); setError("");
    try {
      const r = await submitForm({ data: { kind, payload, hp: String(f.get("website") ?? "") } });
      if (r.ok) { setSent(true); form.reset(); toast.success("Thank you! We’ve got your message."); }
      else setError(r.error);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-5 rounded-3xl border bg-card p-6 shadow-card sm:grid-cols-2 sm:p-8">
      <Honeypot />
      {fields.map((f) => (
        <div key={f.name} className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}>
          <Label htmlFor={f.name} className="mb-2 block text-sm font-bold">{f.label}{f.required && <span className="text-blue"> *</span>}</Label>
          {f.type === "textarea" ? (
            <Textarea id={f.name} name={f.name} required={f.required} rows={5} maxLength={2000} />
          ) : f.type === "select" ? (
            <select id={f.name} name={f.name} required={f.required} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select…</option>
              {f.options?.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <Input id={f.name} name={f.name} type={f.type ?? "text"} required={f.required} maxLength={200} />
          )}
        </div>
      ))}
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <Button type="submit" size="xl" disabled={busy}>{busy ? "Sending…" : submitLabel}</Button>
        {sent && <p role="status" className="text-sm font-bold text-blue">Thank you! We’ll be in touch soon.</p>}
        {error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}
      </div>
    </form>
  );
}

export function NewsletterForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setBusy(true);
    try {
      const r = await submitForm({ data: { kind: "newsletter", payload: { email: String(f.get("email") ?? "").trim() }, hp: String(f.get("website") ?? "") } });
      if (r.ok) { setDone(true); form.reset(); toast.success("You’re on the list! 🎉"); } else toast.error(r.error);
    } catch { toast.error("Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }
  return (
    <form onSubmit={onSubmit} className="relative flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <Honeypot />
      <Input name="email" type="email" required maxLength={200} placeholder="Your email address" aria-label="Email address" className="h-12 border-navy-foreground/20 bg-navy-foreground/5 text-navy-foreground placeholder:text-navy-foreground/40" />
      <Button type="submit" variant="gold" size="xl" disabled={busy}>{busy ? "Joining…" : done ? "Subscribed ✓" : "Subscribe"}</Button>
    </form>
  );
}
