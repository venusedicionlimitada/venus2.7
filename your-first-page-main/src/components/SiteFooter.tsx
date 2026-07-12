import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button"; // O la ruta exacta donde tengas guardado tu botón

export function SiteFooter() {
  return (
    <footer className="mt-0.2">
      {/* Franja de Respiro (Fondo de la página) — Marcas expuestas sobre el fondo claro */}
      <div className="w-full py-8">
        <div className="mx-auto max-w-6xl px-6 flex justify-between items-center">
          
          {/* Objeto original a la izquierda */}
          <div 
            style={{ 
              transform: "scale(0.75)", 
              transformOrigin: "left center",
              width: "fit-content"
            }}
            className="flex flex-col items-center"
          >
            <span 
              style={{ color: "#1C1B1F" }}
              className="font-['Cormorant_Garamond'] text-[2.8rem] tracking-widest uppercase leading-none"
            >
              VENUS
            </span>
            <span 
              style={{ color: "#1C1B1F" }}
              className="font-sans text-[0.8rem] tracking-[0.2em] uppercase leading-none mt-0 translate-x-[5px] translate-y-[0px]"
            >
              EDICIÓN LIMITADA
            </span>
          </div>

          {/* Objeto duplicado alineado a la derecha (Con marco y fondo editables) */}
          <div 
            style={{ 
              transform: "scale(0.55)", 
              transformOrigin: "right center",
              width: "fit-content",
              border: "1px solid #706f6d",        
              padding: "1.2rem 2rem"              
            }}
            className="flex flex-col items-center justify-center"
          >
            <span 
              style={{ color: "#1C1B1F" }}
              className="font-['Cormorant_Garamond'] text-[2.6rem] tracking-[0.1em] uppercase leading-none"
            >
              LUNA FLOW
            </span>
            <span 
              style={{ color: "#1C1B1F" }}
              className="font-sans text-[0.9rem] tracking-[0.3em] uppercase leading-none mt-2 translate-x-[5px] translate-y-[0px]"
            >
              ASTROLOGÍA EMOCIONAL
            </span>
          </div>

        </div>
      </div>

      {/* Línea divisoria con controles inline editables de posición */}
      <div 
        style={{ 
          marginTop: "-18px",      // <--- MODIFICA ESTO PARA SUBIR LA LÍNEA (Usa números más negativos si quieres que suba más)
          marginBottom: "18px"     // <--- MODIFICA ESTO PARA SUBIR LAS COLUMNAS DE ABAJO (Menos píxeles = más arriba)
        }} 
        className="mx-auto max-w-8xl px-16"
      > 
        <div 
          style={{ 
            borderTop: "2px solid rgba(28, 51, 42, 0.8)"
          }} 
          className="w-full"
        ></div>
      </div>

      {/* Franja 2 — crema seda: navegación + contacto (Márgenes superiores reducidos de mt-2 a mt-1) */}
      <div className="section-blancoroto" style={{ marginTop: "-0px" }}>
        <div className="mx-auto max-w-7xl px-10 pt-6 pb-6 md:pt-3 md:pb-9">
          <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-5">
            <div>
              <p className="eyebrow !text-granate">Explorar</p>
              <ul className="mt-1 space-y-1.5 text-sm text-wine">
                <li><Link to="/servicios" className="hover:text-wine">Terapias</Link></li>
                <li><Link to="/diario" className="hover:text-wine">Diario</Link></li>
                <li><Link to="/astrologia" className="hover:text-wine">Astrología</Link></li>
                <li><Link to="/yoga" className="hover:text-wine">Yoga</Link></li>
                <li><Link to="/eventos" className="hover:text-wine">Astrología Emocional</Link></li>
                <li><Link to="/recursos" className="hover:text-wine">Recursos</Link></li>
              </ul>
            </div>

            <div>
              <p className="eyebrow !text-granate translate-x-[-50px]" >Cercanía</p>
              <ul className="mt-1 space-y-1.5 translate-x-[-50px] text-sm text-ink/80">
                <li><Link to="/sobre-mi" className="hover:text-wine">Sobre mí</Link></li>
                <li><Link to="/contacto" className="hover:text-wine">Contacto</Link></li>
              </ul>

              <div className="mt-4">
                <p className="eyebrow !text-granate translate-x-[-50px]">Conversemos</p>
                <p className="mt-1 text-sm translate-x-[-50px] leading-relaxed text-ink/80">
                  Para reservas y consultas personales,{" "}
                  <Link to="/contacto" className="text-wine underline-offset-4 hover:underline">
                    escríbeme aquí
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div>
              <p className="eyebrow !text-granate translate-x-[-60px]">Soporte</p>
              <ul className="mt-1 space-y-1.5 text-sm text-ink/80 translate-x-[-60px]">
                <li><a href="#" className="hover:text-wine">Preguntas Frecuentes</a></li>
                <li><a href="#" className="hover:text-wine">Garantías</a></li>
              </ul>
            </div>

            <div>
              <p className="eyebrow !text-granate translate-x-[-70px]">Comunidad</p>
              <ul className="mt-1 space-y-1.5 text-sm text-ink/80 translate-x-[-70px]">
                <li><a href="#" className="hover:text-wine">Instagram</a></li>
                <li><a href="#" className="hover:text-wine">YouTube</a></li>
              </ul>
            </div>

           <div>
              <p className="eyebrow !text-granate translate-x-[-15px]">Newsletter</p>
              <div className="mt-1">
                <input 
                  type="email" 
                  placeholder="Tu email..." 
                  className="translate-x-[-80px] translate-y-[10px] w-full bg-transparent border-b border-ink/20 pb-1 text-sm focus:outline-none focus:border-wine text-ink"
                />
              </div>
              <div className="mt-3 translate-x-[-80px] translate-y-[20px]">
                <Button>Suscribirme al Newsletter</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Franja Nueva — Base Gold Oklch con controles inline ajustables */}
      <div style={{ backgroundColor: "oklch(0.33 0.045 160)" }} className="py-3">
        <div 
          style={{ 
            color: "#898f2e",          
            letterSpacing: "0.15em",   
            gap: "1.8rem",             
            fontSize: "0.7rem"         
          }}
          className="mx-auto max-w-7xl px-7 flex justify-center font-sans uppercase"
        >
          <Link to="/aviso-legal" className="hover:opacity-70">Aviso Legal</Link>
          <span className="opacity-40">·</span>
          <Link to="/privacidad" className="hover:opacity-80">Política de Privacidad</Link>
          <span className="opacity-40">·</span>
          <Link to="/cookies" className="hover:opacity-80">Política de Cookies</Link>
        </div>
      </div>

      {/* Franja 3 — verde botella: cierre */}
      <div className="section-forest">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="eyebrow text-center text-cream/80">
            © {new Date().getFullYear()} · Venus Edición Limitada
          </p>
        </div>
      </div>
    </footer>
  );
}