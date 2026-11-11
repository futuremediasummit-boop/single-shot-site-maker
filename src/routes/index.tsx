import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-stage.jpg";
import studioImg from "@/assets/studio.jpg";
import { Button } from "@/components/ui/button";
import { AwaitingContent, Section, meta } from "@/components/site/Blocks";
import { NewsletterForm } from "@/components/site/Forms";
import { articles, editions, focusAreas, partners, site, speakers, stats, upcomingSummit } from "@/content/site";

export const Route = createFileRoute("/")({
  head: () => meta("Shaping Conversations. Transforming Media.", "Future Media Summit brings together journalists, broadcasters, creators, technologists and policymakers shaping the future of media."),
  component: Home,
});

function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (now === null) return null;
  const d = Math.max(0, new Date(iso).getTime() - now);
  const parts = [["Days", Math.floor(d / 864e5)], ["Hrs", Math.floor(d / 36e5) % 24], ["Min", Math.floor(d / 6e4) % 60], ["Sec", Math.floor(d / 1e3) % 60]] as const;
  return (
    <div className="flex gap-6">
      {parts.map(([l, v]) => (
        <div key={l}><div className="font-display text-3xl font-bold tabular-nums">{String(v).padStart(2, "0")}</div><div className="eyebrow mt-1 text-navy-foreground/50">{l}</div></div>
      ))}
    </div>
  );
}

function Home() {
  const s = upcomingSummit;
  return (
    <>
      <section className="surface-navy relative -mt-px overflow-hidden">
        <img src={heroImg} alt="Speaker addressing a summit audience beneath a global network display" width={1920} height={1088} className="animate-kenburns absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="bg-hero-fade absolute inset-0" />
        <div className="blob animate-drift -left-24 top-24 h-96 w-96 bg-blue/35" />
        <div className="blob animate-drift right-0 top-1/3 h-80 w-80 bg-gold/20 [animation-delay:-6s]" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 lg:px-8">
          <p className="eyebrow animate-rise text-gold">{s ? `${s.edition} · ${s.year}` : <>Hey, media people <span className="animate-wave">👋</span></>}</p>
          <h1 className="mt-6 animate-rise delay-1 text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">FUTURE<br /><span className="text-gradient">MEDIA</span> SUMMIT</h1>
          <p className="mt-6 max-w-2xl animate-rise delay-2 font-display text-xl italic text-navy-foreground/85 sm:text-2xl">“{site.tagline}”</p>
          <p className="mt-5 max-w-xl animate-rise delay-3 text-navy-foreground/70">A gathering for storytellers, creators, journalists, techies and big thinkers who love media and want to shape where it goes next. Come learn, connect and be inspired.</p>
          <div className="animate-rise delay-4 mt-10 flex flex-wrap gap-4">
            <Button asChild variant="gold" size="xl" className="shiny"><Link to="/tickets">Grab your ticket</Link></Button>
            <Button asChild variant="onDark" size="xl"><Link to="/summit">See what it’s about</Link></Button>
          </div>
          <div className="mt-14 border-t border-navy-foreground/15 pt-8">
            {s ? (
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div className="space-y-2 text-sm text-navy-foreground/80">
                  <p className="font-display text-lg font-semibold text-navy-foreground">{s.theme}</p>
                  <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />{s.dateLabel}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />{s.venue}, {s.city}</p>
                </div>
                {s.startsAt && <Countdown iso={s.startsAt} />}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-6">
                <p className="max-w-lg text-navy-foreground/75"><span className="font-semibold text-gold">The next summit is coming soon!</span> We’ll share the date, venue and theme here first.</p>
                <Link to="/summits" className="inline-flex items-center gap-2 text-base font-semibold text-navy-foreground hover:text-gold">See past summits <ArrowRight className="h-4 w-4" /></Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="surface-navy overflow-hidden border-y border-navy-foreground/10 py-4" aria-hidden="true">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-lg font-bold">
          {[...focusAreas, ...focusAreas].map((f, i) => (
            <span key={i} className="flex items-center gap-10"><span>{f}</span><span className="animate-twinkle text-gold">✦</span></span>
          ))}
        </div>
      </div>

      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-blue">Who we are</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">A place where media people <em className="font-medium text-blue">meet, share</em> and grow together.</h2>
            <span className="gold-rule mt-8" />
            <p className="mt-8 text-lg text-muted-foreground">Future Media Summit is more than one big event. We host a yearly summit and keep the conversation going all year with stories, ideas and new connections.</p>
            <p className="mt-4 text-muted-foreground">Whether you run a newsroom, make videos on your phone, or are just starting out — there’s a seat for you here.</p>
            <Button asChild variant="navy" size="xl" className="mt-10"><Link to="/about">Get to know us</Link></Button>
          </div>
          <img src={studioImg} alt="Broadcast professionals working in a control room" loading="lazy" width={1600} height={1072} className="sticker aspect-[4/3] w-full rounded-3xl object-cover" />
        </div>
      </Section>

      {stats.length > 0 && (
        <Section tone="navy" eyebrow="Impact" title="Our reach">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((st) => (<div key={st.label}><div className="font-display text-4xl font-bold text-gold">{st.value.toLocaleString()}{st.suffix}</div><div className="mt-2 text-sm text-navy-foreground/65">{st.label}</div></div>))}
          </div>
        </Section>
      )}

      <Section tone="mint" eyebrow="Past summits" title="Memories from every summit" intro="Photos, talks and highlights from each year.">
        {editions.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {editions.map((e) => (
              <Link key={e.year} to="/summits/$year" params={{ year: String(e.year) }} className="group rounded-3xl border bg-card p-8 shadow-card transition hover:-translate-y-2 hover:rotate-1">
                <div className="font-display text-5xl font-bold text-navy">{e.year}</div>
                <p className="eyebrow mt-3 text-blue">{e.edition}</p>
                <p className="mt-3 font-medium">{e.theme}</p>
              </Link>
            ))}
          </div>
        ) : (
          <AwaitingContent title="Our first summit is on the way" body="Once it happens, you’ll find all the photos and highlights right here." action={{ to: "/summit", label: "About the summit" }} />
        )}
      </Section>

      <Section eyebrow="Speakers" title="Who’s on stage">
        {speakers.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {speakers.slice(0, 8).map((sp) => (
              <Link key={sp.slug} to="/speakers/$slug" params={{ slug: sp.slug }} className="group">
                <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-mist">{sp.photo && <img src={sp.photo} alt={sp.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />}</div>
                <p className="mt-4 font-display font-semibold">{sp.name}</p>
                <p className="text-sm text-muted-foreground">{sp.title}, {sp.organisation}</p>
              </Link>
            ))}
          </div>
        ) : (
          <AwaitingContent title="Speakers to be announced" body="We’re lining up some amazing people. Check back soon!" action={{ to: "/speakers", label: "Speaker directory" }} />
        )}
      </Section>

      <Section tone="sky" eyebrow="Partners" title="Friends of the summit">
        {partners.length ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{partners.map((p) => (<div key={p.name} className="flex h-28 items-center justify-center rounded-lg border bg-card p-6 font-display font-semibold text-navy">{p.logo ? <img src={p.logo} alt={p.name} className="max-h-12" /> : p.name}</div>))}</div>
        ) : (
          <AwaitingContent title="Want to work with us?" body="We’d love to team up with brands and organisations who care about media." action={{ to: "/become-a-partner", label: "Partner with us" }} />
        )}
      </Section>

      <Section tone="sun" eyebrow="Latest news" title="What’s new">
        {articles.length ? (
          <div className="grid gap-8 md:grid-cols-3">{articles.slice(0, 3).map((a) => (
            <Link key={a.slug} to="/news/$slug" params={{ slug: a.slug }} className="group border-t-2 border-navy pt-6"><p className="eyebrow text-blue">{a.category}</p><h3 className="mt-3 text-xl font-semibold group-hover:text-blue">{a.title}</h3><p className="mt-3 text-sm text-muted-foreground">{a.excerpt}</p></Link>
          ))}</div>
        ) : (
          <AwaitingContent title="Stories coming soon" body="News, interviews and fresh ideas will land here soon." action={{ to: "/news", label: "Visit the newsroom" }} />
        )}
      </Section>

      <section className="surface-navy relative overflow-hidden">
        <div className="grid-lines absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow text-gold">Don’t miss out</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">Get the news first — straight to your inbox.</h2>
          </div>
          <div className="lg:justify-self-end"><NewsletterForm /></div>
        </div>
      </section>
    </>
  );
}
