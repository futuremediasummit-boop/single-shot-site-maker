import { cn } from "@/lib/utils";

/** FMS monogram: orbital ring + play triangle, vector-only. */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-9 w-9", className)} aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path d="M6 30 C 14 40, 36 42, 44 22" fill="none" className="stroke-gold" strokeWidth="2" strokeLinecap="round" />
      <circle cx="44" cy="22" r="2.2" className="fill-gold" />
      <path d="M19 15 L33 24 L19 33 Z" className="fill-blue" />
    </svg>
  );
}

export function Logo({ className, light = true }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", light ? "text-navy-foreground" : "text-navy", className)}>
      <Monogram />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-[0.18em]">FMS</span>
        <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.28em] opacity-70">Future Media Summit</span>
      </span>
    </span>
  );
}
