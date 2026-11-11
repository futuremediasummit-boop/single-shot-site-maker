import { Rocket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LIVE_ORIGIN } from "@/lib/admin-store";

type Props = { dirty: boolean; busy: boolean; publishedAt: number | null; publish: () => Promise<number>; size?: "sm" | "lg"; className?: string };

/** The Publish button. One click puts everything marked Published on the live site. */
export function PublishButton({ dirty, busy, publish, size = "lg", className }: Omit<Props, "publishedAt">) {
  const go = async () => {
    try { await publish(); toast.success("Published! Your changes are now live."); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Publishing didn’t work. Please try again."); }
  };
  return (
    <Button size={size} variant="gold" className={`shiny ${className ?? ""}`} disabled={busy} onClick={go}>
      <Rocket /> {busy ? "Publishing…" : dirty ? "Publish changes" : "Publish"}
      {dirty && !busy && <span className="ml-1 h-2.5 w-2.5 rounded-full bg-destructive" aria-label="Unpublished changes" />}
    </Button>
  );
}

export function PublishPanel(p: Props) {
  return (
    <div className="space-y-5 rounded-3xl border-2 border-blue bg-card p-6 shadow-card sm:p-8">
      <div>
        <h1 className="text-3xl font-extrabold">Publish to the website</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Everything you write here stays a draft until you press Publish. Items switched to <b>Published</b> then appear on <a className="font-bold text-blue underline" href={LIVE_ORIGIN} target="_blank" rel="noopener noreferrer">{LIVE_ORIGIN.replace("https://", "")}</a>; drafts stay hidden.</p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <PublishButton {...p} />
        <p className="text-sm font-bold">
          {p.dirty ? <span className="text-destructive">You have changes that aren’t live yet.</span> : <span className="text-blue">Everything is up to date.</span>}
          {p.publishedAt && <span className="ml-2 font-normal text-muted-foreground">Last published {new Date(p.publishedAt).toLocaleString()}</span>}
        </p>
      </div>
    </div>
  );
}
