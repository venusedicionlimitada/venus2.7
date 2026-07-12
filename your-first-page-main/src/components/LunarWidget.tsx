import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

export function LunarWidget() {
  const [isVisible, setIsVisible] = useState(true);
  const [evento, setEvento] = useState<any>(null);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    async function fetchEventoYPublicaciones() {
      const { data: eventoData, error: eventoError } = await supabase
        .from("lunar_events")
        .select("*")
        .eq("published", true)
        .order("fecha_evento", { ascending: false })
        .limit(1)
        .single();

      if (!eventoError && eventoData) {
        setEvento(eventoData);

        if (eventoData.categoria_emocional) {
          const listaCategorias = eventoData.categoria_emocional
            .split(",")
            .map((c: string) => c.trim().toLowerCase());

          const [
            { data: astroData },
            { data: diaryData },
            { data: resourcesData },
            { data: servicesData },
            { data: yogaData }
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
              const categoriasArticulo = art.categoria_emocional
                .split(",")
                .map((c: string) => c.trim().toLowerCase());
              return listaCategorias.some((cat) => categoriasArticulo.includes(cat));
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
        }
      }
      setLoading(false);
    }
    
    fetchEventoYPublicaciones();
  }, []);

  const publicacionesIntercaladas = (() => {
    const porSeccion: Record<string, any[]> = {};
    publicaciones.forEach((p) => {
      if (!porSeccion[p.seccion]) porSeccion[p.seccion] = [];
      porSeccion[p.seccion].push(p);
    });

    const resultado = [];
    const llaves = Object.keys(porSeccion);
    const maxItems = Math.max(...llaves.map((k) => porSeccion[k].length), 0);

    for (let i = 0; i < maxItems; i++) {
      for (const llave of llaves) {
        if (porSeccion[llave][i]) resultado.push(porSeccion[llave][i]);
      }
    }
    return resultado;
  })();

  const publicacionesVisibles = publicacionesIntercaladas.slice(0, visibleCount);

  if (!isVisible || loading || !evento) return null;

  return (
    <div className="relative w-182 bg-background/75 pt-12 px-12 pb-7 border border-gold/20 shadow-xl backdrop-blur-md">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 text-ink/40 hover:text-ink transition-colors"
      >
        <X size={14} />
      </button>

      <div className="relative w-full h-32"> 
        <div className="absolute top-0 left-0 w-52 h-60 overflow-hidden rounded-md border border-gold/30">
          <img 
            src={evento.cover_image_url || ""} 
            alt={evento.titulo} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <h3 className="absolute top-0 left-58 font-display text-[2rem] text-ink uppercase tracking-[0.02em] whitespace-nowrap">
          {evento.titulo}
        </h3>
        
        <p className="absolute top-11 left-58 text-[1.1rem] text-ink/60 uppercase tracking-[0.2em] whitespace-nowrap">
          {evento.subtitulo}
        </p>

        <p className="absolute top-[85px] left-58 font-sans text-[15px] text-left tracking-[0.1em] text-ink/80 leading-relaxed max-w-[360px]">
          {evento.description}
        </p>
      </div>

      <div className="relative w-full h-24 mt-16">
        <p className="absolute top-0 left-61 w-full text-center text-[1.1rem] text-ink/40 uppercase tracking-[0.1em]">
          El próximo
        </p>
        
        <span className="absolute top-7 left-46 w-full text-center text-[1.8rem] font-sans text-xl text-ink tracking-[0em] italic">
          {evento.fecha_evento 
            ? new Date(evento.fecha_evento + "T12:00:00")
                .toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
                .replace(/^\w/, (c) => c.toUpperCase())
            : ""}
        </span>
        
        <p className="absolute top-16 left-71 w-full text-center text-[1rem] text-ink/50 uppercase tracking-[0.2em]">
          {evento.hora_evento ? evento.hora_evento.slice(0, 5) : ""}
        </p>
      </div>

      <div className="mt-2 text-center">
        <Sheet>
          <SheetTrigger className="inline-block border-b border-granate/50 pb-1 text-[16px] italic tracking-[0.1em] text-granate/90 hover:border-wine hover:text-granate transition-colors cursor-pointer">
            quiero Saber más
          </SheetTrigger>
          
          <SheetContent 
            side="right" 
            className="w-full sm:max-w-xl bg-background border-l border-gold/70 p-0 flex flex-col h-full overflow-y-auto"
          >
            <div className="flex flex-col w-full pt-6 pl-8 pb-10 pr-16">
              <SheetHeader className="text-left mb-2">
                <SheetTitle className="font-display text-3xl text-ink font-normal tracking-wide mb-1">
                  {evento.titulo}
                </SheetTitle>
                
                {evento.subtitulo && (
                  <p 
                    style={{ transform: "translate(2px, -8px)" }} 
                    className="text-[1rem] text-ink/60 uppercase tracking-[0.15em] mb-0"
                  >
                    {evento.subtitulo}
                  </p>
                )}

                {evento.categoria_emocional && (
                  <div className="flex flex-wrap gap-2 mt-0 mb-3">
                    {evento.categoria_emocional.split(",").map((tag: string, index: number) => (
                      <span 
                        key={index} 
                        style={{ fontSize: "11px" }} 
                        className="inline-block border border-gold/30 bg-gold/5 text-ink/80 uppercase tracking-wider rounded-sm px-2 py-0.5"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </SheetHeader>

              <div className="flex-1 flex flex-col min-h-0 mt-0">
                <h4 className="font-display text-2rem text-ink/60 uppercase tracking-widest text-left mb-4 border-b border-gold/10 pb-1">
                  Contenido Relacionado
                </h4>
                
                {publicacionesIntercaladas.length === 0 ? (
                  <p className="text-left text-xs opacity-60 italic">No hay publicaciones con esta sintonía emocional hoy.</p>
                ) : (
                  <div className="flex flex-col gap-6 pb-6">
                    {publicacionesVisibles.map((p) => (
                      <div key={p.id} className="w-full">
                        
                        <div className="section-doradojoya">
                          <a 
                            href={`/${p.seccion}/${p.slug || p.id}`}
                            className="group border border-cream/30 bg-cream/5 p-4 transition-colors hover:border-gold w-full overflow-hidden flex gap-4 items-center relative block cursor-pointer"
                          >
                            {p.cover_image_url && (
                              <img 
                                src={p.cover_image_url} 
                                alt="" 
                                className="w-12 h-12 object-cover flex-shrink-0 border border-cream/10" 
                              />
                            )}
                            <div className="flex flex-col flex-grow min-w-0 text-left">
                              <h5 className="font-display text-base text-ink truncate group-hover:text-gold transition-colors">
                                {p.title || p.titulo}
                              </h5>
                              <p className="font-sans text-xs text-ink/70 line-clamp-2 mt-1 leading-normal">
                                {p.description || p.descripcion || p.extracto || ""}
                              </p>
                            </div>
                          </a>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 px-1 text-[11px]">
                          <span className="eyebrow tag-label uppercase tracking-wider opacity-75">{p.seccion}</span>
                        </div>
                        
                      </div>
                    ))}

                    {publicacionesIntercaladas.length > visibleCount && (
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 6)}
                        className="mt-2 w-full border border-gold/30 bg-gold/5 py-3 text-xs uppercase tracking-widest text-ink/80 hover:border-gold hover:text-gold transition-colors cursor-pointer"
                      >
                        Cargar más
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}