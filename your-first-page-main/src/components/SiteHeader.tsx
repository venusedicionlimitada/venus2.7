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
  const isHome = router.state.location.pathname === "/";
  
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  
  // Si estamos en la Home usa el efecto de scroll; en las demás páginas se ve desde el principio
  const opacity = isHome ? scrollOpacity : 1;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-md">
      {/* He combinado los divs en uno solo para eliminar el espacio muerto */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 md:py-3">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="group flex flex-col leading-none"
        >
          <motion.div 
            style={{ opacity }} 
            // Cambiamos justify-center por justify-start para evitar que el texto se "aplastara" hacia el centro
            className="flex flex-col justify-start w-[220px] overflow-visible"
          >
            {/* Quitamos leading-none y dejamos que el navegador gestione el espacio natural */}
            <span className="font-display text-[2rem] text-ink truncate">
              VENUS
            </span>
            {/* Quitamos leading-none y el translate negativo que podía estar solapando */}
            <span className="font-sans text-[0.5rem] uppercase tracking-[0.2em] mt-0 text-ink truncate translate-x-[3.5px] translate-y-[2px]">
              Edición Limitada
            </span>
          </motion.div>
        </Link>

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

      {/* Menú móvil */}
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