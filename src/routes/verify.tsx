import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageHero, Section } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEvents, verifyTicket, type VerifyResult } from "@/lib/ticketing";

export const Route = createFileRoute("/verify")({
  loader: () => getEvents(),
  head: () => ({ meta: [{ title: "Check-in | Future Media Summit" }, { name: "robots", content: "noindex" }] }),
  component: Verify,
});

const LOOK: Record<VerifyResult["result"], { tone: string; title: string }> = {
  valid: { tone: "bg-green-600", title: "VALID — let them in" },
  already_used: { tone: "bg-amber-500", title: "ALREADY CHECKED IN" },
  wrong_event: { tone: "bg-red-600", title: "WRONG EVENT" },
  not_paid: { tone: "bg-red-600", title: "NOT PAID — do not admit" },
  cancelled: { tone: "bg-red-600", title: "CANCELLED TICKET" },
  not_found: { tone: "bg-red-600", title: "TICKET NOT FOUND" },
  bad_pin: { tone: "bg-red-600", title: "WRONG STAFF PIN" },
  error: { tone: "bg-red-600", title: "SERVER ERROR — try again" },
};

function Verify() {
  const events = Route.useLoaderData();
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [pin, setPin] = useState("");
  const [value, setValue] = useState("");
  const [res, setRes] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const latest = useRef({ eventId, pin });
  latest.current = { eventId, pin };
  const canScan = typeof window !== "undefined" && "BarcodeDetector" in window;

  async function check(v: string) {
    if (!v.trim() || busy) return;
    setBusy(true);
    try { setRes(await verifyTicket({ data: { eventId: latest.current.eventId, pin: latest.current.pin, value: v } })); }
    catch { setRes({ result: "error" }); }
    finally { setBusy(false); setValue(""); }
  }

  useEffect(() => {
    if (!scanning) return;
    let stop = false; let stream: MediaStream | undefined;
    type Detector = { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
    const Ctor = (window as unknown as { BarcodeDetector: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
    const detector = new Ctor({ formats: ["qr_code"] });
    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = videoRef.current; if (!video) return;
      video.srcObject = stream; await video.play();
      while (!stop) {
        const codes = await detector.detect(video);
        if (codes[0]) { setScanning(false); await check(codes[0].rawValue); break; }
        await new Promise((r) => setTimeout(r, 250));
      }
    })().catch(() => setScanning(false));
    return () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  const look = res ? LOOK[res.result] : null;
  return (
    <>
      <PageHero eyebrow="Staff" title="Ticket check-in" intro="Pick the event you are working, then scan or type each ticket. A ticket only works for its own event." />
      <Section>
        <div className="mx-auto grid max-w-xl gap-5 rounded-3xl border bg-card p-6 shadow-card">
          <div>
            <Label htmlFor="ev" className="mb-2 block text-sm font-bold">Event at this door</Label>
            <select id="ev" value={eventId} onChange={(e) => { setEventId(e.target.value); setRes(null); }} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="pin" className="mb-2 block text-sm font-bold">Staff PIN</Label>
            <Input id="pin" type="password" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value)} />
          </div>
          {scanning && <video ref={videoRef} playsInline muted className="w-full rounded-xl bg-black" />}
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); void check(value); }} className="flex gap-2">
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ticket code (TK-…) or link" aria-label="Ticket code" />
            <Button type="submit" disabled={busy || !eventId || !pin}>{busy ? "…" : "Check"}</Button>
          </form>
          {canScan && <Button type="button" variant="outline" disabled={!eventId || !pin} onClick={() => setScanning((s) => !s)}>{scanning ? "Stop camera" : "Scan QR with camera"}</Button>}
          {res && look && (
            <div role="status" className={`rounded-2xl p-5 text-white ${look.tone}`}>
              <p className="text-lg font-extrabold">{look.title}</p>
              {res.name && <p className="mt-1 text-base font-semibold">{res.name}{res.typeName ? ` · ${res.typeName}` : ""}</p>}
              {res.result === "wrong_event" && res.eventName && <p className="mt-1 text-sm">This ticket is for {res.eventName}.</p>}
              {res.result === "already_used" && res.at && <p className="mt-1 text-sm">First scanned {new Date(res.at).toLocaleString("en-KE")}.</p>}
              {res.code && <p className="mt-1 font-mono text-sm opacity-90">{res.code}</p>}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
