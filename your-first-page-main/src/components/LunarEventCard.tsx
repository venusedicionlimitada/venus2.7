import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { InCardCoverImage } from "@/components/SideRecommendImage";

type LunarEventCardProps = {
  onCoverUrl?: (url: string | null) => void;
};

export function LunarEventCard({ onCoverUrl }: LunarEventCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [evento, setEvento] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    async function fetchEventoYPublicaciones() {
      const { data: eventoData, error: eventoError } = await supabase
        .from("lunar_events")
        .select("*")
        .eq("published", true)
        .order("fecha_evento", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!eventoError && eventoData) {
        const fechaFormateada = eventoData.fecha_evento 
          ? new Date(eventoData.fecha_evento + "T12:00:00")
              .toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
              .replace(/^\w/, (c) => c.toUpperCase())
          : "";

        setEvento({
          id: eventoData.id,
          slug: eventoData.slug,
          title: eventoData.titulo,
          subtitle: eventoData.subtitulo,
          date_label: fechaFormateada,
          time_label: eventoData.hora_evento ? eventoData.hora_evento.slice(0, 5) : "",
          description: eventoData.description ?? eventoData.descripcion ?? "",
          categoria_emocional: eventoData.categoria_emocional,
          raw_fecha: eventoData.fecha_evento,
          raw_hora: eventoData.hora_evento,
          cover_image_url: eventoData.cover_image_url ?? null,
        });
        onCoverUrl?.(eventoData.cover_image_url ?? null);

        if (eventoData.categoria_emocional) {
          const listaCategorias = eventoData.categoria_emocional
            .split(",")
            .map((c) => c.trim().toLowerCase());

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

          const filtrarPorSintonia = (articulos) => {
            return (articulos || []).filter((art) => {
              if (!art.categoria_emocional) return false;
              const categoriasArticulo = art.categoria_emocional
                .split(",")
                .map((c) => c.trim().toLowerCase());
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
      } else {
        onCoverUrl?.(null);
      }
      setLoading(false);
    }
    
    fetchEventoYPublicaciones();
  }, [onCoverUrl]);

  useEffect(() => {
    if (!evento || !evento.raw_fecha) return;

    const fechaObjetivo = new Date(`${evento.raw_fecha}T${evento.raw_hora || "00:00:00"}`);

    const intervalo = setInterval(() => {
      const ahora = new Date();
      const diferencia = fechaObjetivo.getTime() - ahora.getTime();

      if (diferencia <= 0) {
        clearInterval(intervalo);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const h = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diferencia / 1000 / 60) % 60);
        const s = Math.floor((diferencia / 1000) % 60);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [evento]);

  const publicacionesIntercaladas = (() => {
    const porSeccion = {};
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

  if (loading) {
    return (
      <div className="section-forest border border-cream/30 bg-cream/5 p-5 sm:p-8 w-full min-h-[240px] md:min-h-[350px] flex items-center justify-center">
        <p className="text-sm text-cream/60 italic">Cargando evento lunar…</p>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="section-forest border border-cream/30 bg-cream/5 p-5 sm:p-8 w-full min-h-[240px] md:min-h-[350px] flex items-center justify-center">
        <p className="text-sm text-cream/60 italic text-center px-6">
          No hay ningún evento lunar publicado. Actívalo en Admin → Eventos.
        </p>
      </div>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div 
        onClick={() => setIsOpen(true)} 
        className="cursor-pointer w-full min-w-0 block text-left"
      >
        <div className="group section-forest border border-cream/30 bg-cream/5 hover:border-gold p-5 sm:p-8 sm:pl-12 flex min-w-0 flex-col justify-between transition-colors w-full min-h-[240px] md:min-h-[350px]">
          
          {/* ===== VERSIÓN MÓVIL (Orden exacto: Próxima, Título, Sub, Descripción, Fecha, Hora, Cuenta atrás) ===== */}
          <div className="flex flex-col sm:hidden w-full min-w-0">
            <span className="font-display text-cream text-lg uppercase tracking-wider mb-4">
              Próxima
            </span>

            <div className="mb-4 w-full min-w-0">
              <h3 className="font-display text-3xl text-cream tracking-wide -mt-1 mb-1 uppercase">
                {evento.title}
              </h3>
              
              {evento.subtitle && (
                <p className="font-sans text-lg uppercase tracking-[0em] text-cream/60 mb-3">
                  {evento.subtitle}
                </p>
              )}
              
              <p className="font-sans text-lg leading-relaxed text-cream/80 -mt-2 mb-2 line-clamp-3">
                {evento.description}
              </p>
            </div>

            <div className="flex flex-col w-full items-start mt-2">
              <div className="flex flex-col items-start mb-2">
                <span className="font-sans text-lg italic text-gold tracking-wide">
                  {evento.date_label}
                </span>
                <span className="font-sans text-sm uppercase tracking-widest text-gold mt-1">
                  {evento.time_label} HS
                </span>
              </div>

              {(timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0) && (
                <div className="mt-3 w-full flex justify-start">
                  <div className="flex flex-col font-mono text-lg tracking-[0.1em] text-gold/90 tabular-nums">
                    <span>{String(timeLeft.days).padStart(2, '\u00A0')} días</span>
                    <span>{timeLeft.hours}h:{timeLeft.minutes}m:{timeLeft.seconds}s</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== VERSIÓN ESCRITORIO (Grid estricto con control de anchos y líneas) ===== */}
          <div className="hidden sm:grid grid-cols-[1fr_auto] gap-6 w-full items-start">
            
            {/* Columna Izquierda (Texto): Ancho fluido pero con límite estricto para no romper */}
            <div className="flex flex-col min-w-0 max-w-full">
              <span className="font-display text-cream text-xl uppercase tracking-wider mb-6 block">
                Próxima
              </span>
              
              <div className="w-full min-w-0">
                <h3 className="font-display text-4xl md:text-5xl text-cream tracking-wide -mt-2 mb-1 uppercase truncate">
                  {evento.title}
                </h3>
                
                {evento.subtitle && (
                  <p className="font-sans text-xl md:text-2xl uppercase tracking-[0em] text-cream/60 mb-4 truncate">
                    {evento.subtitle}
                  </p>
                )}
                
                <p className="font-sans text-lg leading-relaxed text-cream/80 -mt-2 mb-2 line-clamp-3">
                  {evento.description}
                </p>
              </div>
            </div>

            {/* Columna Derecha (Cronómetro): Rígida, no se estira ni se desplaza */}
            <div className="flex flex-col items-end flex-shrink-0">
              <div className="flex flex-col items-end text-right">
                <span className="font-sans text-2xl italic text-gold tracking-wide whitespace-nowrap">
                  {evento.date_label}
                </span>
                <span className="font-sans text-base uppercase tracking-widest text-gold mt-1 whitespace-nowrap">
                  {evento.time_label} HS
                </span>
              </div>

              {(timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0) && (
                <div className="mt-4 flex justify-end">
                  <div className="flex flex-col items-end font-mono text-3xl tracking-[0.1em] text-gold/90 tabular-nums md:text-4xl text-right whitespace-nowrap">
                    <span>{String(timeLeft.days).padStart(2, '\u00A0')} días</span>
                    <span>{timeLeft.hours}h:{timeLeft.minutes}m:{timeLeft.seconds}s</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== ELEMENTOS COMUNES ===== */}
          <InCardCoverImage src={evento.cover_image_url} />

          <div className="mt-2 sm:mt-0 pt-2 flex justify-end">
  <div className="flex flex-col items-end gap-1">
    <span className="inline-block border-b border-cream/30 pb-0.5 text-base italic tracking-[0.1em] text-cream/70 group-hover:text-gold group-hover:border-gold transition-colors">
      quiero saber más
    </span>
    <span className="font-sans text-xs uppercase tracking-widest text-cream/60">
      CONTENIDO RELACIONADO
    </span>
  </div>
</div>
        </div>
      </div>
      
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl bg-background border-l border-gold/70 p-0 flex flex-col h-full overflow-y-auto"
      >
        <div className="flex flex-col w-full pt-6 px-6 pb-10 sm:pl-8 sm:pr-16">
          <SheetHeader className="text-left mb-2">
            <SheetTitle className="font-display text-2xl sm:text-3xl text-ink font-normal tracking-wide mb-1">
              {evento.title}
            </SheetTitle>
            
            {evento.subtitle && (
              <p 
                style={{ transform: "translate(2px, -8px)" }} 
                className="text-[1rem] text-ink/60 uppercase tracking-[0.15em] mb-0"
              >
                {evento.subtitle}
              </p>
            )}

            {evento.categoria_emocional && (
              <div className="flex flex-wrap gap-2 mt-0 mb-3">
                {evento.categoria_emocional.split(",").map((tag, index) => (
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
                          <p className="font-sans text-xs text-ink/70 line-clamp-3 mt-1 leading-normal">
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
  );
}