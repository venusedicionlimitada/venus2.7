import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/diario", label: "Diario" },
  { to: "/yoga", label: "Yoga" },
  { to: "/astrologia", label: "Astrología" },
  { to: "/eventos", label: "Astrología Emocional" },
  { to: "/recursos", label: "Recursos" },
  { to: "/servicios", label: "Terapias" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const isHome = currentPath === "/";
  
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  
  const opacity = isHome ? scrollOpacity : 1;

  // Encontramos la etiqueta de la sección actual para mostrarla en el móvil
  const currentLink = links.find((l) => {
    if (l.to === "/") return currentPath === "/";
    return currentPath.startsWith(l.to);
  });
  const currentLabel = currentLink ? currentLink.label : "";

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 sm:bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 md:py-3 relative">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="group flex flex-col leading-none"
        >
          <motion.div 
            style={{ opacity }} 
            className="flex flex-col justify-start w-auto max-w-[180px] sm:max-w-[220px] overflow-visible"
          >
            <span className="font-display text-xl sm:text-[2rem] text-ink truncate">
              VENUS
            </span>
            <span className="font-sans text-[0.6rem] sm:text-[0.6rem] uppercase tracking-[0.1em] font-normal hidden sm:block mt-1.5 sm:mt-0 text-ink truncate translate-x-[2px] translate-y-0 sm:translate-x-[2.5px] sm:translate-y-[1px]">
              Edición Limitada
            </span>
          </motion.div>
        </Link>

        {/* Sección activa centrada en dispositivos móviles con el mismo efecto de opacidad */}
{currentLabel && (
  <motion.div 
    style={{ opacity }}
    className="absolute left-1/2 -translate-x-1/2 lg:hidden text-center pointer-events-none px-2 max-w-[calc(100%-140px)] truncate"
  >
    <span className="text-[0.55rem] uppercase tracking-[0.2em] text-ink/90 font-normal border-b border-forest pb-0.5">
      {currentLabel}
    </span>
  </motion.div>
)}

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[0.72rem] uppercase tracking-[0.28em] text-ink/65 transition-colors hover:text-wine"
              activeProps={{ className: "text-ink font-bold text-[0.72rem] border-b border-forest pb-1"}}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden text-ink"
          aria-label="Abrir menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border/40 bg-background lg:hidden">
          <ul className="flex flex-col px-6 py-4">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm uppercase tracking-[0.25em] text-ink/80"
                  activeProps={{ className: "text-ink font-bold border-b border-gold pb-1"}}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}