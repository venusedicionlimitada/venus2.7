import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sectionIsOpen, useSectionFlags } from "@/lib/hooks/useSectionActive";

function extractoDe(p: { description?: string | null; descripcion?: string | null; excerpt?: string | null; extracto?: string | null }) {
  return (p.description || p.descripcion || p.excerpt || p.extracto || "").trim();
}

function nombreSeccion(seccion: string) {
  if (seccion === "diario") return "Reflexiones";
  if (seccion === "astrologia") return "Astrología";
  if (seccion === "yoga") return "Yoga";
  if (seccion === "recursos") return "Recursos";
  if (seccion === "servicios") return "Terapias";
  return seccion;
}

export function CategoryDetailSheet({ categoria, descripcion }: { categoria: string; descripcion?: string }) {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionFlags = useSectionFlags();

  useEffect(() => {
    async function fetchRelated() {
      const [{ data: astro }, { data: diary }, { data: res }, { data: serv }, { data: yoga }] = await Promise.all([
        supabase.from("astrology_articles").select("*"),
        supabase.from("diary_entries").select("*"),
        supabase.from("resources").select("*"),
        supabase.from("services").select("*"),
        supabase.from("yoga_articles").select("*")
      ]);

      const filtrar = (items: any[]) => (items || []).filter(item => 
        item.categoria_emocional?.toLowerCase().includes(categoria.toLowerCase())
      );

      const porSeccion = [
        filtrar(astro).map(p => ({...p, seccion: "astrologia"})),
        filtrar(diary).map(p => ({...p, seccion: "diario"})),
        filtrar(res).map(p => ({...p, seccion: "recursos"})),
        filtrar(serv).map(p => ({...p, seccion: "servicios"})),
        filtrar(yoga).map(p => ({...p, seccion: "yoga"})),
      ];
      const maxItems = Math.max(...porSeccion.map((grupo) => grupo.length), 0);
      const intercaladas: any[] = [];
      for (let i = 0; i < maxItems; i++) {
        for (const grupo of porSeccion) {
          if (grupo[i]) intercaladas.push(grupo[i]);
        }
      }
      setPublicaciones(intercaladas);
      setLoading(false);
    }
    fetchRelated();
  }, [categoria]);

  return (
    <div className="p-8">
      <h2 className="font-display text-3xl text-ink mb-6">{categoria}</h2>
      {descripcion ? (
        <p className="mb-8 text-base leading-relaxed text-ink/80">{descripcion}</p>
      ) : null}
      {loading ? <p>Cargando conexiones...</p> : (
        <div className="space-y-5">
          {publicaciones.map(p => {
            const extracto = extractoDe(p);
            const titulo = (
              <>
                <h5 className="text-sm font-bold uppercase md:font-sans md:text-base md:font-medium md:leading-snug md:tracking-[0.04em]">{p.title || p.titulo}</h5>
                {extracto ? (
                  <p className="mt-2 font-sans text-base leading-relaxed text-ink/90 line-clamp-2">{extracto}</p>
                ) : null}
              </>
            );
            const cerrado = p.active === false || !sectionIsOpen(sectionFlags, p.seccion);
            return (
              <div key={p.id}>
                {cerrado ? (
                  <div className="block border border-[color-mix(in_oklch,var(--marco)_70%,var(--fondo))] bg-[color-mix(in_oklch,var(--fondo)_60%,var(--cream))] p-4">
                    {titulo}
                    <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-gold">Próximamente</p>
                  </div>
                ) : (
                  <a href={`/${p.seccion}/${p.slug || p.id}?desde=eventos`} className="block border border-[color-mix(in_oklch,var(--marco)_70%,var(--fondo))] bg-[color-mix(in_oklch,var(--fondo)_60%,var(--cream))] p-4 transition-colors duration-150 hover:border-[var(--titulo)]">
                    {titulo}
                  </a>
                )}
                <p className="mt-2 px-1 font-sans text-sm uppercase tracking-[0.14em] text-gold">{nombreSeccion(p.seccion)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}