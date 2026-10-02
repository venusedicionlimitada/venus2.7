import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { siteRequiresGate } from "@/lib/landingHost";

export function SiteGate({ children }: { children: ReactNode }) {
  const { session, isAdmin, roleReady, loading } = useAuth();
  const pending = loading || !roleReady;
  if (!siteRequiresGate() || (!pending && isAdmin)) return children;
  return <GateScreen loading={pending} denied={!pending && !!session && !isAdmin} />;
}

function GateScreen({ loading, denied }: { loading: boolean; denied: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        /invalid login/i.test(message)
          ? "Correo o contraseña incorrectos."
          : "No se ha podido entrar. Revisa el correo y la contraseña.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function useAnotherAccount() {
    setError(null);
    await supabase.auth.signOut();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="eyebrow text-gold">En preparación</p>
          <h1 className="mt-4 font-display text-4xl text-ink">Venus</h1>
          <p className="mt-4 text-sm font-light text-ink/70">
            Esta web aún no está publicada. Entra con tu acceso para verla.
          </p>
        </div>

        {denied ? (
          <div className="mt-10 text-center">
            <p className="text-sm text-ink/70">Esta cuenta no tiene acceso a la web.</p>
            <button
              type="button"
              onClick={useAnotherAccount}
              className="mt-6 border border-gold px-6 py-4 text-xs uppercase tracking-[0.3em] text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
            >
              Usar otra cuenta
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label className="eyebrow block text-ink/70" htmlFor="gate-email">Correo</label>
              <input
                id="gate-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-3 w-full border border-border bg-background/50 px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="eyebrow block text-ink/70" htmlFor="gate-password">Contraseña</label>
              <input
                id="gate-password"
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-3 w-full border border-border bg-background/50 px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-wine">{error}</p>}

            <button
              type="submit"
              disabled={busy || loading}
              className="w-full border border-gold bg-gold/10 px-6 py-4 text-xs uppercase tracking-[0.3em] text-gold transition-colors hover:bg-gold hover:text-primary-foreground disabled:opacity-50"
            >
              {busy ? "Un momento…" : "Entrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
