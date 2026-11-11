import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children?: ReactNode }) {
  return (
    <section className="surface-navy relative overflow-hidden">
      <div className="grid-lines absolute inset-0 opacity-60" />
      <div className="blob animate-drift -right-20 -top-24 h-80 w-80 bg-blue/40" />
      <div className="blob animate-drift -bottom-24 left-1/4 h-72 w-72 bg-gold/25 [animation-delay:-5s]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 lg:px-8 lg:pt-28">
        <p className="eyebrow animate-rise text-gold">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl animate-rise text-4xl font-bold leading-[1.05] sm:text-6xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl animate-rise text-lg text-navy-foreground/70">{intro}</p>}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}

export function Section({ eyebrow, title, intro, children, className, tone = "ivory" }: { eyebrow?: string; title?: string; intro?: string; children?: ReactNode; className?: string; tone?: "ivory" | "mist" | "navy" | "mint" | "sky" | "sun" }) {
  const toneCls = { navy: "surface-navy", mist: "bg-mist/60", mint: "bg-mint/25", sky: "bg-sky/25", sun: "bg-gold/20", ivory: "" }[tone];
  return (
    <section className={cn("py-20 lg:py-28", toneCls, className)}>
      <div className="reveal mx-auto max-w-7xl px-5 lg:px-8">
        {(eyebrow || title) && (
          <div className="mb-12 max-w-3xl">
            {eyebrow && <p className={cn("eyebrow", tone === "navy" ? "text-gold" : "text-blue")}>{eyebrow}</p>}
            {title && <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h2>}
            {intro && <p className={cn("mt-5 text-lg", tone === "navy" ? "text-navy-foreground/70" : "text-muted-foreground")}>{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/** Designed placeholder shown wherever verified content has not been published yet. */
export function AwaitingContent({ title, body, action, dark }: { title: string; body: string; action?: { to: string; label: string }; dark?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center sm:p-14", dark ? "border-navy-foreground/20" : "border-input bg-card")}>
      <Sparkles className="animate-twinkle mx-auto h-7 w-7 text-gold" />
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className={cn("mx-auto mt-3 max-w-lg", dark ? "text-navy-foreground/65" : "text-muted-foreground")}>{body}</p>
      {action && (
        <Link to={action.to} className="mt-6 inline-block text-sm font-semibold text-blue hover:underline">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

export function meta(title: string, description: string) {
  const t = `${title} | Future Media Summit`;
  return {
    meta: [
      { title: t },
      { name: "description", content: description },
      { property: "og:title", content: t },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
