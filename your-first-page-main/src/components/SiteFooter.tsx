import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

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

          <div className="w-full sm:w-auto flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center scale-[0.55] sm:scale-[0.55] origin-center sm:origin-right border border-[#706f6d] px-6 py-4 sm:px-8 sm:py-5">
              <span className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.6rem] text-ink tracking-[0.1em] uppercase leading-none">
                LUNA FLOW
              </span>
              <span className="font-sans text-[0.75rem] sm:text-[0.9rem] text-ink tracking-[0.3em] uppercase leading-none mt-2 translate-x-[5px]">
                ASTROLOGÍA EMOCIONAL
              </span>
            </div>
            <p className="sm:hidden font-display italic text-sm text-ink/80 tracking-wide mt-[-10px] text-center">
              by VENUS EDICIÓN LIMITADA
            </p>
          </div>

        </div>
      </div>

      {/* Línea divisoria */}
      <div className="mx-auto max-w-8xl px-6 md:px-16 -mt-2 sm:-mt-[18px] mb-4 sm:mb-[18px]"> 
        <div className="w-full border-t-2 border-forest/80" />
      </div>

      {/* Navegación + contacto */}
      <div className="section-forest">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 pt-6 pb-6 md:pt-3 md:pb-9">
          <div className="grid grid-cols-2 gap-8 sm:gap-12 sm:grid-cols-2 md:grid-cols-5">
            <div>
              <p className="eyebrow !text-gold">Explorar</p>
              <ul className="mt-1 space-y-1.5 text-sm text-cream">
                <li><Link to="/servicios" className="hover:text-gold">Terapias</Link></li>
                <li><Link to="/diario" className="hover:text-gold">Diario</Link></li>
                <li><Link to="/astrologia" className="hover:text-gold">Astrología</Link></li>
                <li><Link to="/yoga" className="hover:text-gold">Yoga</Link></li>
                <li><Link to="/eventos" className="hover:text-gold">Astrología Emocional</Link></li>
                <li><Link to="/recursos" className="hover:text-gold">Recursos</Link></li>
              </ul>
            </div>

            <div>
              <p className="eyebrow !text-gold md:-translate-x-[50px]">Cercanía</p>
              <ul className="mt-1 space-y-1.5 md:-translate-x-[50px] text-sm text-cream/80">
                <li><Link to="/sobre-mi" className="hover:text-gold">Sobre mí</Link></li>
                <li><Link to="/contacto" className="hover:text-gold">Contacto</Link></li>
              </ul>

              <div className="mt-4">
                <p className="eyebrow !text-gold md:-translate-x-[50px]">Conversemos</p>
                <p className="mt-1 text-sm md:-translate-x-[50px] leading-relaxed text-cream/80">
                  Para reservas y consultas personales,{" "}
                  <Link to="/contacto" className="text-gold underline-offset-4 hover:underline">
                    escríbeme aquí
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div>
              <p className="eyebrow !text-gold md:-translate-x-[60px]">Soporte</p>
              <ul className="mt-1 space-y-1.5 text-sm text-cream/80 md:-translate-x-[60px]">
                <li><a href="#" className="hover:text-gold">Preguntas Frecuentes</a></li>
                <li><a href="#" className="hover:text-gold">Garantías</a></li>
              </ul>
            </div>

            <div>
              <p className="eyebrow !text-gold md:-translate-x-[70px]">Comunidad</p>
              <ul className="mt-1 space-y-1.5 text-sm text-cream/80 md:-translate-x-[70px]">
                <li><a href="#" className="hover:text-gold">Instagram</a></li>
                <li><a href="#" className="hover:text-gold">YouTube</a></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <p className="eyebrow !text-gold md:-translate-x-[15px]">Newsletter</p>
              <div className="mt-1 md:-translate-x-[80px] md:translate-y-[10px]">
                <input 
                  type="email" 
                  placeholder="Tu email..." 
                  className="w-full bg-transparent border-b border-gold/80 pb-1 text-sm focus:outline-none focus:border-wine text-cream"
                />
              </div>
              <div className="w-full flex justify-center md:block mt-3 md:-translate-x-[80px] md:translate-y-[20px]">
                <Button className="border border-gold bg-gold text-cream hover:bg-transparent hover:text-wine transition-colors rounded-full md:rounded-md">
                  Suscribirme a Newsletter
                </Button>
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