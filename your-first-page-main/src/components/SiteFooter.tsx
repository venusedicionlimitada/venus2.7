import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

function NewsletterSignup() {
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
    return (
      <p className="mt-1 text-sm text-cream/80">
        Te has suscrito. Gracias.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-1">
        <input
          type="email"
          name="email"
          required
          placeholder="Tu email..."
          className="w-full bg-transparent border-b border-gold/80 pb-1 text-sm focus:outline-none focus:border-wine text-cream"
        />
      </div>
      <div className="mt-3 flex w-full justify-center md:block">
        <Button
          type="submit"
          disabled={sending}
          className="border border-gold bg-gold/70 text-cream hover:bg-cream hover:text-wine transition-colors rounded-full md:w-full md:tracking-widest md:rounded-3xl disabled:opacity-60"
        >
          {sending ? "Enviando…" : "Suscribirme a Newsletter"}
        </Button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-cream/80">
          {error}
        </p>
      )}
    </form>
  );
}

function FooterSupport() {
  return (
    <>
      <p className="eyebrow tracking-[0.12em] !text-gold md:tracking-[0.35em]">Soporte</p>
      <ul className="mt-1 space-y-1.5 text-sm text-cream/80">
        <li><a href="#" className="hover:text-gold">Preguntas Frecuentes</a></li>
      </ul>
    </>
  );
}

function SocialIcon({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a href="#" aria-label={label} className="inline-flex text-cream/80 hover:text-gold">
      {children}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-0.2">
      {/* Franja de Respiro — Marcas */}
      <div className="w-full py-4 sm:py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row justify-between items-center gap-8 sm:gap-4">
          
          <div className="hidden sm:flex flex-col items-center sm:items-start scale-75 sm:scale-75 origin-center sm:origin-left">
            <span className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.8rem] text-ink tracking-widest uppercase leading-none">
              VENUS
            </span>
            <span className="font-sans text-[0.7rem] sm:text-[0.8rem] text-ink tracking-[0.2em] uppercase leading-none mt-0 translate-x-[5px]">
              EDICIÓN LIMITADA
            </span>
          </div>

          <div className="mt-4 flex w-full flex-col items-center justify-center sm:mt-0 sm:w-auto">
            <div className="flex flex-col items-center justify-center scale-[0.65] sm:scale-[0.55] origin-center sm:origin-right border border-[#706f6d] px-6 py-4 sm:px-8 sm:py-5">
              <span className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.6rem] text-ink tracking-[0.1em] uppercase leading-none">
                LUNA FLOW
              </span>
              <span className="font-sans text-[0.75rem] sm:text-[0.9rem] text-ink tracking-[0.3em] uppercase leading-none mt-2 translate-x-[5px]">
                ASTROLOGÍA EMOCIONAL
              </span>
            </div>
            <p className="mt-8 text-center font-display text-sm italic tracking-wide text-ink/80 sm:hidden">
  by <span className="font-display not-italic font-normal">VENUS</span> <span className="not-italic font-sans text-[0.45rem] tracking-[0.1em] uppercase font-normal">EDICIÓN LIMITADA</span>
</p>
          </div>

        </div>
      </div>

      {/* Navegación + contacto */}
      <div className="section-forest">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 pt-6 pb-6 md:pt-3 md:pb-9">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4 md:gap-10 xl:grid-cols-[max-content_max-content_minmax(0,1fr)] xl:justify-start xl:gap-x-14">
            <div className="md:order-1">
              <p className="eyebrow tracking-[0.12em] !text-gold md:tracking-[0.35em]">Explorar</p>
              <ul className="mt-1 text-sm text-cream max-md:flex max-md:flex-col max-md:gap-1.5 md:space-y-1.5">
                <li className="max-md:order-6"><Link to="/servicios" className="hover:text-gold">Terapias</Link></li>
                <li className="max-md:order-1"><Link to="/diario" className="hover:text-gold">Reflexiones</Link></li>
                <li className="max-md:order-4"><Link to="/astrologia" className="hover:text-gold">Astrología</Link></li>
                <li className="max-md:order-2"><Link to="/yoga" className="hover:text-gold">Yoga</Link></li>
                <li className="max-md:order-3"><Link to="/eventos" className="hover:text-gold">Astrología Emocional</Link></li>
                <li className="max-md:order-5"><Link to="/recursos" className="hover:text-gold">Recursos</Link></li>
                <li className="max-md:order-7"><Link to="/app" className="hover:text-gold">App</Link></li>
              </ul>
            </div>

            <div className="md:hidden">
              <FooterSupport />
            </div>

            <div className="md:order-2">
              <div className="md:block">
                <p className="eyebrow tracking-[0.12em] !text-gold md:tracking-[0.35em]">Comunidad</p>
                <ul className="mt-1 flex items-center justify-start gap-4 text-cream/80 md:block md:space-y-1.5 md:text-sm">
                  <li>
                    <span className="md:hidden">
                      <SocialIcon label="Instagram">
                        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                          <circle cx="12" cy="12" r="3.8" />
                          <circle cx="17.4" cy="6.6" r="0.8" fill="currentColor" stroke="none" />
                        </svg>
                      </SocialIcon>
                    </span>
                    <a href="#" className="hidden hover:text-gold md:inline">Instagram</a>
                  </li>
                  <li>
                    <span className="md:hidden">
                      <SocialIcon label="Facebook">
                        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
                          <path d="M14.2 8.4h2.3V5.6h-2.3c-2 0-3.4 1.4-3.4 3.5v1.5H8.6v2.8h2.2V20h2.8v-6.6h2.3l.4-2.8h-2.7V9.3c0-.5.3-.9.9-.9z" />
                        </svg>
                      </SocialIcon>
                    </span>
                    <a href="#" className="hidden hover:text-gold md:inline">Facebook</a>
                  </li>
                  <li>
                    <span className="md:hidden">
                      <SocialIcon label="YouTube">
                        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
                          <path d="M22.5 12.2s0-3-.4-4.3c-.2-.8-.8-1.5-1.6-1.7C19 5.8 12 5.8 12 5.8s-7 0-8.5.4c-.8.2-1.4.9-1.6 1.7-.4 1.3-.4 4.3-.4 4.3s0 3 .4 4.3c.2.8.8 1.5 1.6 1.7 1.5.4 8.5.4 8.5.4s7 0 8.5-.4c.8-.2 1.4-.9 1.6-1.7.4-1.3.4-4.3.4-4.3zM9.9 15.4V9l5.8 3.2-5.8 3.2z" />
                        </svg>
                      </SocialIcon>
                    </span>
                    <a href="#" className="hidden hover:text-gold md:inline">YouTube</a>
                  </li>
                </ul>
              </div>
              <div className="mt-8 hidden md:block">
                <FooterSupport />
              </div>
            </div>

            <div className="contents md:order-3 md:col-span-2 md:grid md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:content-start md:items-start md:gap-x-8 md:gap-y-8 xl:col-span-1 xl:grid-cols-[17rem_minmax(0,1fr)] xl:gap-x-14">
              <div>
                <p className="mt-1 text-lg leading-relaxed italic text-cream/90 xl:whitespace-nowrap">
                  Cada proceso comienza con <span className="max-md:block">una conversación</span>
                </p>
                <Button
                  asChild
                  size="sm"
                  className="mt-3 h-9 w-full whitespace-nowrap rounded-full border border-gold bg-gold/70 px-3 text-center text-sm leading-tight text-cream transition-colors hover:bg-cream hover:text-wine md:h-9 md:w-full md:px-4 md:py-2 md:text-base md:font-normal md:italic md:leading-normal md:tracking-widest md:rounded-3xl"
                >
                  <Link to="/contacto">Escríbeme aquí</Link>
                </Button>
              </div>

              <div className="md:col-span-1 md:col-start-1">
                <p className="eyebrow tracking-[0.12em] !text-gold md:tracking-[0.35em]">Newsletter</p>
                <NewsletterSignup />
              </div>

              <div className="mt-6 flex w-full flex-col items-center md:col-start-2 md:row-start-1 md:row-span-2 md:mt-0 md:flex-row md:items-start md:justify-end md:self-stretch md:pl-6">
                <div className="flex flex-col items-center">
                  <div className="border border-gold/45 px-4 py-3 md:px-[1.19rem] md:py-[0.95rem]">
                    <p className="flex w-fit flex-col items-end">
                      <span className="font-display text-[2.45rem] leading-none tracking-[0.06em] text-cream md:text-[3rem]">
                        VENUS
                      </span>
                      <span className="mt-1 font-sans text-[0.5rem] leading-none tracking-[0.18em] text-cream md:mt-[0.18rem] md:text-[0.58rem]">
                        App
                      </span>
                    </p>
                  </div>
                  <p className="mt-3 whitespace-nowrap text-center font-display text-[clamp(1.2rem,7vw,1.7rem)] font-light italic leading-none tracking-[0.04em] text-cream/80 md:whitespace-normal md:text-[1.83rem] md:leading-[1.05] md:tracking-wide">
                    Cuéntale a Venus
                  </p>
                  <a
                    href="https://app.venusedicionlimitada.com"
                    className="mt-4 inline-flex items-center justify-center rounded-xl border border-gold bg-granate px-5 py-2.5 text-center text-[0.78rem] font-medium uppercase tracking-[0.16em] text-cream transition-colors hover:bg-gold hover:text-granate md:px-4 md:py-3 md:text-[0.88rem] md:tracking-[0.18em]"
                  >
                    Conoce la App
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Base legal */}
      <div className="py-3" style={{ backgroundColor: "oklch(0.33 0.045 160)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-7 flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-7 font-sans uppercase text-[0.65rem] sm:text-[0.7rem] tracking-[0.15em] text-[#898f2e]">
          <Link to="/aviso-legal" className="hover:opacity-70">Aviso Legal</Link>
          <span className="opacity-40 hidden sm:inline">·</span>
          <Link to="/privacidad" className="hover:opacity-80">Política de Privacidad</Link>
          <span className="opacity-40 hidden sm:inline">·</span>
          <Link to="/cookies" className="hover:opacity-80">Política de Cookies</Link>
        </div>
      </div>

      {/* Cierre */}
      <div className="section-forest">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="eyebrow text-center text-cream/80 tracking-[0em]">
            © {new Date().getFullYear()} · Venus Edición Limitada
          </p>
        </div>
      </div>
    </footer>
  );
}