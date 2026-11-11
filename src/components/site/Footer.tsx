import { Link } from "@tanstack/react-router";
import { site } from "@/content/site";
import { Logo } from "./Logo";

const cols = [
  { title: "Organisation", links: [["/about", "About Us"], ["/about/our-story", "Our Story"], ["/about/leadership", "Leadership"], ["/contact", "Contact"]] },
  { title: "Summit", links: [["/summit", "The Summit"], ["/summits", "Archives"], ["/speakers", "Speakers"], ["/tickets", "Tickets"]] },
  { title: "Partners", links: [["/partners", "Partners"], ["/sponsors", "Sponsors"], ["/become-a-partner", "Become a Partner"]] },
  { title: "Media", links: [["/media", "Media Centre"], ["/media/accreditation", "Accreditation"], ["/media/press-releases", "Press Releases"], ["/media/media-kit", "Media Kit"], ["/news", "News & Insights"]] },
] as const;

export function Footer() {
  return (
    <footer className="surface-navy relative border-t-4 border-gold">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs font-display text-sm italic text-navy-foreground/70">“{site.tagline}”</p>
            {site.contact.email && <p className="mt-4 text-sm text-navy-foreground/70">{site.contact.email}</p>}
            {site.social.length > 0 && <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">{site.social.map((s) => (<li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-navy-foreground/70 hover:text-gold">{s.label}</a></li>))}</ul>}
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="eyebrow text-gold">{c.title}</h4>
              <ul className="mt-5 space-y-3">
                {c.links.map(([to, label]) => (
                  <li key={to}><Link to={to} className="inline-block text-sm text-navy-foreground/70 transition hover:translate-x-1 hover:text-gold">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-navy-foreground/10 pt-6 text-xs text-navy-foreground/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Future Media Summit · Made with <span className="animate-twinkle inline-block text-blue">♥</span> for media people</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-navy-foreground">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="hover:text-navy-foreground">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
