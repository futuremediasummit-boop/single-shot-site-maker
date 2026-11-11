import { useEffect, useState } from "react";
import { Download, KeyRound, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LIVE_ORIGIN, type Data } from "@/lib/admin-store";
import { CONTENT_REPO } from "@/lib/live-config";
import { fetchLive, publishToGithub } from "@/lib/live-content";

const TOKEN_KEY = "fms-gh-token";

export function LivePublish({ data, replaceAll }: { data: Data; replaceAll: (d: Partial<Data>) => void }) {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<number | null>(null);
  useEffect(() => { try { setToken(localStorage.getItem(TOKEN_KEY) ?? ""); } catch { /* ignore */ } }, []);
  const saveToken = (v: string) => { setToken(v); try { localStorage.setItem(TOKEN_KEY, v.trim()); } catch { /* ignore */ } };
  const pub = Object.values(data).reduce((n, list) => n + list.filter((i) => i.published).length, 0);

  const publish = async () => {
    if (!token.trim()) { toast.error("Paste your GitHub token first."); return; }
    setBusy(true);
    try { setLast(await publishToGithub(token.trim(), data)); toast.success("Published. The site updates within about a minute."); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Publish failed."); }
    finally { setBusy(false); }
  };
  const load = async () => {
    const live = await fetchLive();
    if (!live) { toast.error("Nothing published yet (or the repo is private)."); return; }
    if (window.confirm("Replace what is in this browser with the last published version?")) { replaceAll(live.data as Partial<Data>); toast.success("Loaded."); }
  };

  return (
    <div className="space-y-5 rounded-3xl border-2 border-blue bg-card p-6 shadow-card">
      <div>
        <h1 className="text-3xl font-extrabold">Publish to the website</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">One click. Everything marked Published goes live on <a className="font-bold text-blue underline" href={LIVE_ORIGIN} target="_blank" rel="noopener noreferrer">{LIVE_ORIGIN.replace("https://", "")}</a> within about a minute. No code editing.</p>
      </div>
      <label className="block text-sm font-bold">
        <span className="flex items-center gap-2"><KeyRound className="h-4 w-4" />GitHub token (saved in this browser only)</span>
        <Input type="password" value={token} onChange={(e) => saveToken(e.target.value)} placeholder="github_pat_..." className="mt-2 max-w-xl rounded-full" autoComplete="off" />
        <span className="mt-1 block text-xs font-normal text-muted-foreground">Fine-grained token for <code>{CONTENT_REPO}</code> only, permission "Contents: Read and write". Create once at github.com/settings/personal-access-tokens/new.</span>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" variant="gold" className="shiny" disabled={busy} onClick={publish}><Rocket /> {busy ? "Publishing..." : `Publish now (${pub} live items)`}</Button>
        <Button size="lg" variant="outline" onClick={load}><Download /> Load last published</Button>
        {last && <span className="text-sm font-bold text-blue">Published {new Date(last).toLocaleTimeString()}</span>}
      </div>
    </div>
  );
}
