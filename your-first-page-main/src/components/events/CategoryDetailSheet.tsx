import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function CategoryDetailSheet({ categoria }: { categoria: string }) {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      setPublicaciones([
        ...filtrar(astro).map(p => ({...p, seccion: "astrologia"})),
        ...filtrar(diary).map(p => ({...p, seccion: "diario"})),
        ...filtrar(res).map(p => ({...p, seccion: "recursos"})),
        ...filtrar(serv).map(p => ({...p, seccion: "servicios"})),
        ...filtrar(yoga).map(p => ({...p, seccion: "yoga"}))
      ]);
      setLoading(false);
    }
    fetchRelated();
  }, [categoria]);

  return (
    <div className="p-8">
      <h2 className="font-display text-3xl text-ink mb-6">{categoria}</h2>
      {loading ? <p>Cargando conexiones...</p> : (
        <div className="space-y-4">
          {publicaciones.map(p => (
            <a key={p.id} href={`/${p.seccion}/${p.slug || p.id}`} className="block p-4 border border-gold/20 hover:border-gold transition-colors">
              <h5 className="text-sm font-bold uppercase">{p.title || p.titulo}</h5>
              <p className="text-xs text-ink/60">{p.seccion}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}