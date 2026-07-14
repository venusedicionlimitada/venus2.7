import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function EventDetailSheet({ evento }: { evento: any }) {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      if (!evento?.categoria_emocional) {
        setLoading(false);
        return;
      }

      const listaCategorias = evento.categoria_emocional
        .split(",")
        .map((c: string) => c.trim().toLowerCase());

      // Fetch de todas las tablas
      const [
        { data: astroData }, { data: diaryData },
        { data: resourcesData }, { data: servicesData }, { data: yogaData }
      ] = await Promise.all([
        supabase.from("astrology_articles").select("*"),
        supabase.from("diary_entries").select("*"),
        supabase.from("resources").select("*"),
        supabase.from("services").select("*"),
        supabase.from("yoga_articles").select("*")
      ]);

      const filtrarPorSintonia = (articulos: any[] | null) => {
        return (articulos || []).filter((art) => {
          if (!art.categoria_emocional) return false;
          const cats = art.categoria_emocional.split(",").map((c: string) => c.trim().toLowerCase());
          return listaCategorias.some((cat) => cats.includes(cat));
        });
      };

      const combinadas = [
        ...filtrarPorSintonia(astroData).map((p) => ({ ...p, seccion: "astrologia" })),
        ...filtrarPorSintonia(diaryData).map((p) => ({ ...p, seccion: "diario" })),
        ...filtrarPorSintonia(resourcesData).map((p) => ({ ...p, seccion: "recursos" })),
        ...filtrarPorSintonia(servicesData).map((p) => ({ ...p, seccion: "servicios" })),
        ...filtrarPorSintonia(yogaData).map((p) => ({ ...p, seccion: "yoga" })),
      ];

      setPublicaciones(combinadas);
      setLoading(false);
    }

    fetchRelated();
  }, [evento]);

  return (
    <div className="flex flex-col w-full pt-6 pl-8 pb-10 pr-16">
      <SheetHeader className="text-left mb-6">
        <SheetTitle className="font-display text-3xl text-ink font-normal tracking-wide">
          {evento.titulo}
        </SheetTitle>
      </SheetHeader>

      <h4 className="font-display text-2xl text-ink/60 uppercase tracking-widest text-left mb-4 border-b border-gold/10 pb-1">
        Contenido Relacionado
      </h4>

      {loading ? <p className="text-sm italic">Buscando sintonía...</p> : (
        <div className="flex flex-col gap-6 pb-6">
          {publicaciones.map((p) => (
            <a key={p.id} href={`/${p.seccion}/${p.slug || p.id}`} className="block group border border-cream/30 bg-cream/5 p-4 hover:border-gold transition-colors">
              <h5 className="font-display text-base text-ink group-hover:text-gold">{p.title || p.titulo}</h5>
              <p className="text-xs text-ink/70 mt-1">{p.description || ""}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}