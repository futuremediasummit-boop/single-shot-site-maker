import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { AwaitingContent, PageHero, Section } from "@/components/site/Blocks";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { getTicket } from "@/lib/ticketing";

export const Route = createFileRoute("/ticket/$token")({
  loader: ({ params }) => getTicket({ data: { token: params.token } }),
  head: () => ({ meta: [{ title: "Your ticket | Future Media Summit" }, { name: "robots", content: "noindex" }] }),
  component: Ticket,
});

function Ticket() {
  const { token } = Route.useParams();
  const t = Route.useLoaderData();
  const [qr, setQr] = useState("");

  useEffect(() => {
    if (!t || t.status !== "issued") return;
    // The QR holds the ticket link, so a phone camera opens it and the scanner reads the token from it.
    QRCode.toDataURL(`${window.location.origin}/ticket/${token}`, { margin: 1, width: 320, errorCorrectionLevel: "M" }).then(setQr).catch(() => setQr(""));
  }, [t, token]);

  if (!t) {
    return (<><PageHero eyebrow="Digital ticket" title="Ticket lookup" /><Section><AwaitingContent title="Ticket not found" body="This ticket link is invalid or hasn’t been issued. Check the link you were given." action={{ to: "/tickets", label: "Back to tickets" }} /></Section></>);
  }
  return (
    <>
      <PageHero eyebrow="Digital ticket" title={t.status === "issued" ? "You’re in!" : "Reservation received"} intro={t.status === "issued" ? "Show this QR code at the entrance. Save this page or take a screenshot." : t.status === "pending_payment" ? "Your spot is reserved. Your QR code appears here once payment is confirmed." : "This ticket has been cancelled."} />
      <Section tone="sun">
        <div className="animate-pop mx-auto flex max-w-2xl flex-col overflow-hidden rounded-3xl bg-navy text-navy-foreground shadow-card sm:flex-row">
          <div className="flex-1 p-8">
            <Logo />
            <p className="eyebrow mt-8 text-gold">{t.event.name}</p>
            <p className="mt-3 font-display text-3xl font-extrabold">{t.name}</p>
            <p className="eyebrow mt-1 text-gold">{t.typeName}</p>
            <p className="mt-6 text-sm text-navy-foreground/70">{t.event.dateLabel}<br />{t.event.venue}, {t.event.city}</p>
            <p className="mt-4 font-mono text-sm tracking-widest text-navy-foreground/80">{t.code}</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 border-t-2 border-dashed border-navy-foreground/30 bg-navy-deep p-6 sm:border-l-2 sm:border-t-0">
            {t.status === "issued" && qr ? <img src={qr} alt={`QR code for ticket ${t.code}`} className="h-44 w-44 rounded-xl bg-white p-2" /> : <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-navy-foreground/10 p-4 text-center text-xs text-navy-foreground/60">{t.status === "issued" ? "Loading…" : t.status === "pending_payment" ? "Awaiting payment" : "Cancelled"}</div>}
            {t.checkedIn && <p className="text-xs font-bold text-gold">Already checked in</p>}
          </div>
        </div>
        {t.status === "issued" && <div className="mt-6 text-center"><Button variant="outline" onClick={() => window.print()}>Print ticket</Button></div>}
      </Section>
    </>
  );
}
