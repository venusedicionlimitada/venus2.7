import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { SiteHeader } from "../components/SiteHeader";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso · Venus" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/admin", replace: true });
  }, [session, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
      <div className="text-center">
        <p className="eyebrow text-gold">Acceso privado</p>
        <h1 className="mt-4 font-display text-4xl text-ink">
          {mode === "login" ? "Entrar" : "Crear cuenta"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label className="eyebrow block text-ink/70" htmlFor="email">Correo</label>
          <input
            id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-3 w-full border border-border bg-background/50 px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="eyebrow block text-ink/70" htmlFor="password">Contraseña</label>
          <input
            id="password" type="password" required minLength={8} value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-3 w-full border border-border bg-background/50 px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-wine">{error}</p>}

        <button
          type="submit" disabled={busy}
          className="w-full border border-gold bg-gold/10 px-6 py-4 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors disabled:opacity-50"
        >
          {busy ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      <button
        onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
        className="mt-6 text-center text-xs uppercase tracking-[0.25em] text-ink/60 hover:text-gold"
      >
        {mode === "login" ? "¿Primera vez? Crear cuenta" : "Ya tengo cuenta · Entrar"}
      </button>

      <Link to="/" className="mt-8 text-center text-[0.7rem] uppercase tracking-[0.3em] text-ink/40 hover:text-ink/70">
        ← Volver al inicio
      </Link>
    </div>
  );
}
