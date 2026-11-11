import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

export const nav = [
  { to: "/about", label: "About Us" },
  { to: "/summit", label: "The Summit" },
  { to: "/summits", label: "Archives" },
  { to: "/speakers", label: "Speakers" },
  { to: "/partners", label: "Partners" },
  { to: "/media", label: "Media Centre" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-navy-foreground/10 surface-navy">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" aria-label="Future Media Summit home"><Logo /></Link>
        <nav className="hidden items-center gap-6 xl:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm font-medium text-navy-foreground/75 transition-colors hover:text-navy-foreground" activeProps={{ className: "!text-gold" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 xl:flex">
          <Button asChild variant="onDark" size="sm"><Link to="/become-a-partner">Partner with us</Link></Button>
          <Button asChild variant="gold" size="sm"><Link to="/tickets">Get tickets</Link></Button>
        </div>
        <button className="text-navy-foreground xl:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-navy-foreground/10 px-5 pb-6 xl:hidden">
          <nav className="flex flex-col py-2">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="border-b border-navy-foreground/10 py-3 font-medium text-navy-foreground/85">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button asChild variant="onDark"><Link to="/become-a-partner" onClick={() => setOpen(false)}>Partner with us</Link></Button>
            <Button asChild variant="gold"><Link to="/tickets" onClick={() => setOpen(false)}>Get tickets</Link></Button>
          </div>
        </div>
      )}
    </header>
  );
}
