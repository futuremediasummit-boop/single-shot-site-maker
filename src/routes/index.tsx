import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CalendarPlus, Check, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-stage.jpg";
import studioImg from "@/assets/studio.jpg";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AwaitingContent, DraftBadge, PhotoTile, Section, meta } from "@/components/site/Blocks";
import { NewsletterForm } from "@/components/site/Forms";
import { articles, focusAreas, partners, pastEditions, site, speakers, stats, ticketTypes, upcomingSummit } from "@/content/site";
import { downloadIcs, eventJsonLd, summitState } from "@/lib/summit-state";

const ld = upcomingSummit ? eventJsonLd(upcomingSummit, "https://futuremediasummit.lovable.app") : null;

export const Route = createFileRoute("/")({
  head: () => ({
    ...meta("Shaping Conversations. Transforming Media.", "Future Media Summit brings together journalists, broadcasters, creators, technologists and policymakers shaping the future of media."),
    ...(ld ? { scripts: [{ type: "application/ld+json", children: ld }] } : {}),
  }),
  component: Home,
});

function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (now === null) return null;
  const d = Math.max(0, new Date(iso).getTime() - now);
  const parts = [["Days", Math.floor(d / 864e5)], ["Hrs", Math.floor(d / 36e5) % 24], ["Min", Math.floor(d / 6e4) % 60], ["Sec", Math.floor(d / 1e3) % 60]] as const;
  return (
    <div className="flex gap-6" aria-label="Countdown to the summit">
      {parts.map(([l, v]) => (
        <div key={l}><div className="font-display text-3xl font-bold tabular-nums">{String(v).padStart(2, "0")}</div><div className="eyebrow mt-1 text-navy-foreground/50">{l}</div></div>
      ))}
    </div>
  );
}

const benefits = [
  ["Learn", "Talks, panels and workshops with people who are shaping media.", "bg-mint/50"],
  ["Connect", "Meet journalists, creators, broadcasters and technologists in one place.", "bg-sky/50"],
  ["Be seen", "Speak, exhibit or sponsor and put your work in front of the industry.", "bg-gold/40"],
  ["Stay in the loop", "Join the community for stories and updates all year round.", "bg-mist"],
] as const;

const faqs = [
  ["Who is the summit for?", "Journalists and editors, broadcasters, content creators, technologists, policymakers and anyone who loves media. Beginners are welcome too."],
  ["How do I get a ticket?", "Visit the Tickets page to see the options. When sales open you can register there and receive a digital ticket by email. Until then, join the waitlist and we’ll tell you first."],
  ["Can my company sponsor or exhibit?", "Yes! Tell us about your organisation on the Become a Partner page and the team will get back to you."],
  ["I’m a journalist. Can I attend as press?", "Apply on the Media accreditation page. Accredited journalists get access to sessions, the press area and interview chances."],
  ["How will I hear about news first?", "Subscribe to the newsletter at the bottom of this page and we’ll send the big announcements straight to your inbox."],
] as const;

function Home() {
  const s = upcomingSummit;
  const state = summitState(s);
  const hasDate = !!s?.startsAt;
  const live = state === "live";
  const upcoming = state === "open" || state === "announced";

  const eyebrow = s && state !== "ended" ? <>{s.edition} · {s.year}{live && " · Happening now"}</> : state === "ended" ? <>Thanks for joining us 🎉</> : <>Hey, media people <span className="animate-wave">👋</span></>;
  const primary = state === "open" ? { to: "/tickets", label: "Get your ticket" } : state === "announced" ? { to: "/tickets", label: "Join the waitlist" } : live ? { to: "/summit", label: "See the programme" } : { to: "/tickets", label: "Get notified" };
  const secondary = pastEditions.length && !upcoming ? { to: "/summits", label: "See past summits" } : { to: "/summit", label: "See what it’s about" };
  const openTickets = ticketTypes.slice(0, 3);

  return (
    <>
      <section className="surface-navy relative -mt-px overflow-hidden">
        <img src={heroImg} alt="Speaker addressing a summit audience beneath a global network display" width={1920} height={1088} className="animate-kenburns absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="bg-hero-fade absolute inset-0" />
        <div className="blob animate-drift -left-24 top-24 h-96 w-96 bg-blue/35" />
        <div className="blob animate-drift right-0 top-1/3 h-80 w-80 bg-gold/20 [animation-delay:-6s]" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 lg:px-8">
          <p className="eyebrow animate-rise text-gold">{eyebrow}</p>
          <h1 className="mt-6 animate-rise delay-1 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">FUTURE<br /><span className="text-gradient">MEDIA</span> SUMMIT</h1>
          <p className="mt-6 max-w-2xl animate-rise delay-2 font-display text-xl italic text-navy-foreground/85 sm:text-2xl">“{site.tagline}”</p>
          <p className="mt-5 max-w-xl animate-rise delay-3 text-navy-foreground/70">A gathering for storytellers, creators, journalists, techies and big thinkers who love media and want to shape where it goes next. Come learn, connect and be inspired.</p>
          <div className="animate-rise delay-4 mt-10 flex flex-wrap gap-4">
            <Button asChild variant="gold" size="xl" className="shiny"><Link to={primary.to}>{primary.label}</Link></Button>
            <Button asChild variant="onDark" size="xl"><Link to={secondary.to}>{secondary.label}</Link></Button>
          </div>
          <div className="mt-14 border-t border-navy-foreground/15 pt-8">
            {s && state !== "ended" ? (
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div className="space-y-2 text-sm text-navy-foreground/80">
                  <p className="font-display text-lg font-semibold text-navy-foreground">{s.theme} {s.draft && <DraftBadge>Draft</DraftBadge>}</p>
                  <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />{s.dateLabel}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />{s.venue}, {s.city}</p>
                  {hasDate && <button type="button" onClick={() => downloadIcs(s)} className="mt-2 inline-flex items-center gap-2 rounded-full border border-navy-foreground/30 px-4 py-1.5 text-sm font-bold transition hover:bg-navy-foreground/10"><CalendarPlus className="h-4 w-4" />Add to calendar</button>}
                </div>
                {hasDate && !live && <Countdown iso={s.startsAt!} />}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-6">
                <p className="max-w-lg text-navy-foreground/75"><span className="font-semibold text-gold">{state === "ended" ? "See you at the next one!" : "The next summit is coming soon!"}</span> We’ll share the date, venue and theme here first. Sign up below to hear it before anyone else.</p>
                <a href="#updates" className="inline-flex items-center gap-2 text-base font-semibold text-navy-foreground hover:text-gold">Get the news first <ArrowRight className="h-4 w-4" /></a>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="surface-navy overflow-hidden border-y border-navy-foreground/10 py-4" aria-hidden="true">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-lg font-bold">
          {[...focusAreas, ...focusAreas].map((f, i) => (<span key={i} className="flex items-center gap-10"><span>{f}</span><span className="animate-twinkle text-gold">✦</span></span>))}
        </div>
      </div>

      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-blue">Who we are</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">A place where media people <em className="font-medium text-blue">meet, share</em> and grow together.</h2>
            <span className="gold-rule mt-8" />
            <p className="mt-8 text-lg text-muted-foreground">Future Media Summit is more than one big event. We host a yearly summit and keep the conversation going all year with stories, ideas and new connections.</p>
            <p className="mt-4 text-muted-foreground">Whether you run a newsroom, make videos on your phone, or are just starting out, there’s a seat for you here.</p>
            <Button asChild variant="navy" size="xl" className="mt-10"><Link to="/about">Get to know us</Link></Button>
          </div>
          <img src={studioImg} alt="Broadcast professionals working in a control room" loading="lazy" width={1600} height={1072} className="sticker aspect-[4/3] w-full rounded-3xl object-cover" />
        </div>
      </Section>

      <Section tone="mint" eyebrow="Why come" title="What’s in it for you">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(([t, d, c]) => (<div key={t} className={`reveal rounded-3xl p-7 transition hover:-translate-y-2 hover:rotate-1 ${c}`}><h3 className="text-xl font-bold">{t}</h3><p className="mt-3 text-sm text-navy/80">{d}</p></div>))}
        </div>
      </Section>

      {upcoming && (
        <Section tone="sky" eyebrow="Tickets" title={state === "open" ? "Grab your seat" : "Tickets are on the way"} intro={state === "open" ? "Pick the ticket that fits you and get a digital ticket by email." : "Prices aren’t confirmed yet. Join the waitlist and you’ll hear first when sales open."}>
          <div className="grid gap-5 md:grid-cols-3">
            {openTickets.map((t) => (
              <div key={t.slug} className="reveal flex flex-col rounded-3xl border bg-card p-7 shadow-card transition hover:-translate-y-2">
                <h3 className="text-xl font-bold">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
                <p className="mt-4 font-display text-3xl font-extrabold text-navy">{t.price}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">{t.perks.slice(0, 3).map((p) => (<li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue" />{p}</li>))}</ul>
              </div>
            ))}
          </div>
          <Button asChild size="xl" className="mt-8"><Link to="/tickets">{state === "open" ? "See all tickets" : "Join the waitlist"}</Link></Button>
        </Section>
      )}

      {stats.length > 0 && (
        <Section tone="navy" eyebrow="Impact" title="Our reach">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((st) => (<div key={st.label}><div className="font-display text-4xl font-bold text-gold">{st.value.toLocaleString()}{st.suffix}</div><div className="mt-2 text-sm text-navy-foreground/65">{st.label}</div></div>))}
          </div>
        </Section>
      )}

      <Section eyebrow="Speakers" title="Who’s on stage">
        {speakers.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {speakers.slice(0, 8).map((sp, i) => (
              <Link key={sp.slug} to="/speakers/$slug" params={{ slug: sp.slug }} className="group">
                <PhotoTile src={sp.photo} name={sp.name} i={i} />
                <p className="mt-4 font-display font-semibold">{sp.name}</p>
                <p className="text-sm text-muted-foreground">{sp.title}, {sp.organisation}</p>
              </Link>
            ))}
          </div>
        ) : (
          <AwaitingContent title="Speakers to be announced" body="We’re lining up some amazing people. Check back soon!" action={{ to: "/speakers", label: "Speaker directory" }} />
        )}
      </Section>

      <Section tone="mist" eyebrow="Past summits" title="Memories from every summit" intro="Photos, talks and highlights from each year.">
        {pastEditions.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {pastEditions.map((e) => (
              <Link key={e.year} to="/summits/$year" params={{ year: String(e.year) }} className="group rounded-3xl border bg-card p-8 shadow-card transition hover:-translate-y-2 hover:rotate-1">
                <div className="flex items-start justify-between"><div className="font-display text-5xl font-bold text-navy">{e.year}</div>{e.draft && <DraftBadge>Draft</DraftBadge>}</div>
                <p className="eyebrow mt-3 text-blue">{e.edition}</p>
                <p className="mt-3 font-medium">{e.theme}</p>
              </Link>
            ))}
          </div>
        ) : (
          <AwaitingContent title="Our first summit is on the way" body="Once it happens, you’ll find all the photos and highlights right here." action={{ to: "/summit", label: "About the summit" }} />
        )}
      </Section>

      <Section tone="sun" eyebrow="Partners & sponsors" title="Put your brand where media people gather">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            {partners.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{partners.map((p) => (<div key={p.name} className="flex h-24 items-center justify-center rounded-3xl border bg-card p-5 font-display font-semibold text-navy">{p.logo ? <img src={p.logo} alt={p.name} className="max-h-12" /> : p.name}</div>))}</div>
            ) : (
              <p className="text-lg text-navy/80">Reach journalists, creators, broadcasters and decision-makers in one room. Sponsor, exhibit or partner with the summit and we’ll shape a package around your goals.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <Button asChild size="xl"><Link to="/become-a-partner">Partner with us</Link></Button>
            <Button asChild variant="outline" size="xl"><Link to="/sponsors">Sponsorship tiers</Link></Button>
          </div>
        </div>
      </Section>

      <Section eyebrow="Latest news" title="What’s new">
        {articles.length ? (
          <div className="grid gap-8 md:grid-cols-3">{articles.slice(0, 3).map((a) => (
            <Link key={a.slug} to="/news/$slug" params={{ slug: a.slug }} className="reveal group rounded-3xl border bg-card p-6 shadow-card transition hover:-translate-y-2"><p className="eyebrow text-blue">{a.category}</p><h3 className="mt-3 text-xl font-semibold group-hover:text-blue">{a.title}</h3><p className="mt-3 text-sm text-muted-foreground">{a.excerpt}</p></Link>
          ))}</div>
        ) : (
          <AwaitingContent title="Stories coming soon" body="News, interviews and fresh ideas will land here soon." action={{ to: "/news", label: "Visit the newsroom" }} />
        )}
      </Section>

      <Section tone="sky" eyebrow="Questions" title="Good to know">
        <Accordion type="single" collapsible className="max-w-3xl space-y-3">
          {faqs.map(([q, a]) => (
            <AccordionItem key={q} value={q} className="rounded-3xl border bg-card px-6"><AccordionTrigger className="text-left font-bold">{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>
          ))}
        </Accordion>
      </Section>

      <section id="updates" className="surface-navy relative scroll-mt-20 overflow-hidden">
        <div className="grid-lines absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow text-gold">Don’t miss out</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">{upcoming ? "Be first to hear the news." : "Get the news first, straight to your inbox."}</h2>
            <p className="mt-4 max-w-md text-navy-foreground/70">Dates, speakers, ticket drops and behind-the-scenes stories. No spam.</p>
          </div>
          <div className="lg:justify-self-end"><NewsletterForm /></div>
        </div>
      </section>

      {upcoming && s && (
        <>
          <div className="h-20 lg:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 shadow-lg backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-md items-center justify-between gap-3">
              <div className="min-w-0 text-sm"><p className="truncate font-bold">{s.dateLabel}</p><p className="truncate text-muted-foreground">{s.city}</p></div>
              <Button asChild><Link to="/tickets">{state === "open" ? "Get tickets" : "Join waitlist"}</Link></Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
