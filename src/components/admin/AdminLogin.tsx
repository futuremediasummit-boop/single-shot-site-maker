import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Sign-in screen. Accounts are created by an admin in Supabase; there is no public sign-up. */
export function AdminLogin({ signIn }: { signIn: (email: string, password: string) => Promise<string | null> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError("");
    const err = await signIn(String(f.get("email") ?? ""), String(f.get("password") ?? ""));
    if (err) setError(err);
    setBusy(false);
  }

  return (
    <div className="surface-navy relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div className="blob animate-drift -right-20 -top-24 h-96 w-96 bg-blue/40" />
      <div className="blob animate-drift -bottom-24 left-1/4 h-80 w-80 bg-gold/25 [animation-delay:-5s]" />
      <div className="animate-pop relative w-full max-w-md rounded-3xl bg-card p-8 text-card-foreground shadow-card sm:p-10">
        <Link to="/" aria-label="Back to the website"><Logo /></Link>
        <h1 className="mt-8 flex items-center gap-2 text-3xl font-extrabold"><Lock className="h-6 w-6 text-blue" />Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">For the summit team. Ask an admin if you need an account.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div><Label htmlFor="email" className="mb-2 block text-sm font-bold">Email</Label><Input id="email" name="email" type="email" autoComplete="username" required maxLength={200} /></div>
          <div><Label htmlFor="password" className="mb-2 block text-sm font-bold">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" required maxLength={200} /></div>
          {error && <p role="alert" className="rounded-2xl bg-destructive/10 p-3 text-sm font-bold text-destructive">{error}</p>}
          <Button type="submit" size="xl" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        </form>
      </div>
    </div>
  );
}
