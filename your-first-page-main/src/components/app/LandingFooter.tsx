import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

function LandingNewsletter() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    setError(null);

    const { error: sendError } = await supabase.rpc("subscribe_newsletter", {
      p_email: String(form.get("email") ?? ""),
    });

    setSending(false);
    if (sendError) {
      setError("No se ha podido suscribir. Inténtalo de nuevo en un momento.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return <p className="mt-4 text-sm text-cream/80">Te has suscrito. Gracias.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-4 max-w-sm">
      <input
        type="email"
        name="email"
        required
        placeholder="Tu email..."
        className="w-full border-b border-gold/80 bg-transparent pb-1 text-center text-sm text-cream focus:border-wine focus:outline-none"
      />
      <Button
        type="submit"
        disabled={sending}
        className="mt-4 rounded-full border border-gold bg-gold/70 text-cream transition-colors hover:bg-cream hover:text-wine disabled:opacity-60"
      >
        {sending ? "Enviando…" : "Suscribirme a Newsletter"}
      </Button>
      {error && <p className="mt-3 text-sm text-cream/80">{error}</p>}
    </form>
  );
}

export function LandingFooter() {
  return (
    <footer>
      <div className="section-forest">
        <div className="mx-auto max-w-xl px-6 py-10 text-center">
          <p className="eyebrow !text-gold">Newsletter</p>
          <LandingNewsletter />
        </div>
      </div>

      <div className="py-3" style={{ backgroundColor: "oklch(0.33 0.045 160)" }}>
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-4 gap-y-2 px-4 font-sans text-[0.65rem] uppercase tracking-[0.15em] text-[#898f2e] sm:gap-x-7 sm:px-7 sm:text-[0.7rem]">
          <Link to="/aviso-legal" className="hover:opacity-70">Aviso Legal</Link>
          <span className="hidden opacity-40 sm:inline">·</span>
          <Link to="/privacidad" className="hover:opacity-80">Política de Privacidad</Link>
          <span className="hidden opacity-40 sm:inline">·</span>
          <Link to="/cookies" className="hover:opacity-80">Política de Cookies</Link>
        </div>
      </div>

      <div className="section-forest">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="eyebrow text-center tracking-[0em] text-cream/80">
            © {new Date().getFullYear()} · Venus Edición Limitada
          </p>
        </div>
      </div>
    </footer>
  );
}
