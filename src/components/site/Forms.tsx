import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type Field = { name: string; label: string; type?: "text" | "email" | "tel" | "textarea" | "select"; options?: string[]; required?: boolean; full?: boolean };

/** Generic enquiry form. Submissions are validated but not yet stored (preview mode). */
export function EnquiryForm({ fields, submitLabel }: { fields: Field[]; submitLabel: string }) {
  const [sent, setSent] = useState(false);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    toast.info("Preview mode: online submissions will be saved once the summit office goes live.");
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-lg border bg-card p-6 shadow-card sm:grid-cols-2 sm:p-8">
      {fields.map((f) => (
        <div key={f.name} className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}>
          <Label htmlFor={f.name} className="mb-2 block text-sm font-medium">{f.label}{f.required && <span className="text-blue"> *</span>}</Label>
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
        <Button type="submit" size="xl">{submitLabel}</Button>
        {sent && <p className="text-sm text-muted-foreground">Thank you. This form is in preview — nothing has been sent yet.</p>}
      </div>
    </form>
  );
}

export function NewsletterForm() {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); toast.info("Preview mode: newsletter sign-ups open when the summit office goes live."); }}
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <Input type="email" required placeholder="Your email address" aria-label="Email address" className="h-12 border-navy-foreground/20 bg-navy-foreground/5 text-navy-foreground placeholder:text-navy-foreground/40" />
      <Button type="submit" variant="gold" size="xl">Subscribe</Button>
    </form>
  );
}
