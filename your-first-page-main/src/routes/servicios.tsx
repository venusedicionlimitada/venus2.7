import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "../components/SiteHeader";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Terapias · Venus Edición Limitada" },
      { name: "description", content: "Sesiones de acompañamiento terapéutico, lectura de carta astral y prácticas guiadas de yoga." },
      { property: "og:title", content: "Terapias · Venus" },
      { property: "og:description", content: "Sesiones de acompañamiento, lectura de carta y yoga." },
    ],
  }),
  component: Servicios,
});

type Service = { id: string; num: string; title: string; duration: string; body: string };

function Servicios() {
  const [items, setItems] = useState<Service[] | null>(null);

  useEffect(() => {
    supabase.from("services")
      .select("id, num, title, duration, body")
      .eq("published", true).order("sort_order")
      .then(({ data }) => setItems((data ?? []) as Service[]));
  }, []);

  return (
<>
      <SiteHeader />

      <div className="bg-silk-gold min-h-screen w-full">
        {/* Cabecera totalmente suelta */}
<header className="text-left">
          {/* Título independiente */}
          <h1 className="font-display text-5xl text-ink/80 font-extralight md:text-7xl pt-14 px-18 font-light">
            Un ritual a tu medida
          </h1>
          
          {/* Párrafo independiente */}
          <p className="max-w-5xl text-base leading-relaxed text-wine md:text-lg pt-4 px-20">
            Cada propuesta es un espacio sostenido. Toda reserva se gestiona de manera personal — escríbeme contándome qué buscas y conversamos.
          </p>
        </header>

{/* Contenedor del Carrusel de Enfoque Central */}
        <div className="mx-auto max-w-7xl px-6 mt-24 pb-32">

          {items === null ? (
            <p className="text-center text-sm text-ink/60">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-ink/60">Pronto.</p>
          ) : (
            <div className="relative">
              <Carousel 
                opts={{ align: "center", loop: true }} 
                className="w-full"
                setApi={(api) => {
                  if (!api) return;
                  
                  const updateIndex = () => {
                    const centerIndex = api.selectedScrollSnap();
                    const itemsElements = api.slideNodes();
                    
                    itemsElements.forEach((node, index) => {
                      const htmlNode = node as HTMLElement;
                      if (index === centerIndex) {
                        htmlNode.style.opacity = "1";
                        htmlNode.style.transform = "scale(1)";
                      } else {
                        htmlNode.style.opacity = "0.4";
                        htmlNode.style.transform = "scale(0.9)";
                      }
                    });
                  };

                  api.on("select", updateIndex);
                  api.on("init", updateIndex);
                  updateIndex();
                }}
              >
                <CarouselContent className="-ml-4 items-center">
                  {items.map((s) => (
                    /* MEDIDA BASE DEL BLOQUE:
                       - 'md:basis-800px]' controla el ancho en ordenador (hazlo más grande si lo quieres más alargado).
                       - 'min-h-[300px]' controla la altura mínima del bloque.
                    */
                    <CarouselItem key={s.id} className="pl-4 basis-full sm:basis-[550px] md:basis-[650px] transition-all duration-500 ease-out">
                      
                      {/* EL CONTENEDOR (LA TARJETA):
                         - 'p-8 md:p-10' es el relleno interno general.
                         - 'flex flex-col justify-between' distribuye el contenido y el botón de solicitar info.
                      */}
                      <article className="bg-background/50 backdrop-blur-sm pt-14 pb-8 px-12 md:px-16 text-left min-h-[300px] flex flex-col justify-between shadow-sm border border-gold/10 rounded-md">
                        
                        {/* BLOQUE DE CONTENIDOS SEPARADOS:
                           - 'space-y-4' añade una separación vertical automática entre el título, la duración y el cuerpo. 
                           Puedes cambiar el número (space-y-2, space-y-6) o quitarlo y meter márgenes individuales.
                        */}
                        <div className="space-y-4">
                          
                          {/* 1. Bloque del Título */}
                          <div className="pt-0">
                            <h2 className="font-display text-2xl md:text-3xl text-ink font-normal tracking-wide">
                              {s.title}
                            </h2>
                          </div>
                          
                          {/* 2. Bloque de la Duración */}
                          <div className="pt-0">
                            <p className="eyebrow text-ink/50 text-xs tracking-[0.2em] uppercase">
                              {s.duration}
                            </p>
                          </div>
                          
                          {/* 3. Bloque del Cuerpo de texto */}
                          <div className="pt-2">
                            <p className="text-sm leading-relaxed text-ink/75 whitespace-pre-wrap font-light">
                              {s.body}
                            </p>
                          </div>

                        </div>
                        
                        {/* 4. Bloque del Botón (Apertura Lateral) */}
                        <div className="pt-6 text-right">
                          <Sheet>
                            <SheetTrigger className="inline-block border-b border-gold/40 pb-1 text-xs uppercase tracking-[0.25em] text-gold hover:border-gold transition-colors text-left bg-transparent cursor-pointer">
                              Solicitar info
                            </SheetTrigger>
                            
                            <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-gold/20 p-10 flex flex-col justify-between">
                              <SheetHeader className="text-left space-y-4">
                                <SheetTitle className="font-display text-3xl text-ink font-normal tracking-wide">
                                  {s.title}
                                </SheetTitle>
                                <p className="eyebrow text-ink/50 text-xs tracking-[0.2em] uppercase !mt-1">
                                  {s.duration}
                                </p>
                                <SheetDescription className="text-sm leading-relaxed text-ink/75 font-light pt-4 whitespace-pre-wrap">
                                  {s.body}
                                </SheetDescription>
                              </SheetHeader>

                              <div className="mt-8 pt-6 border-t border-gold/10">
                                <Link to="/contacto" className="inline-block border-b border-gold/60 pb-1 text-xs uppercase tracking-[0.25em] text-gold hover:border-gold transition-colors">
                                  Iniciar conversación
                                </Link>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </div>

                      </article>

                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                <div className="hidden md:block">
                  <CarouselPrevious className="absolute -left-16 top-1/2 -translate-y-1/2 bg-transparent border-gold/30 text-gold hover:bg-gold/10 size-12" />
                  <CarouselNext className="absolute -right-16 top-1/2 -translate-y-1/2 bg-transparent border-gold/30 text-gold hover:bg-gold/10 size-12" />
                </div>
              </Carousel>
            </div>
          )}

          <p className="mt-32 text-center text-sm text-ink/60">
            Los precios y disponibilidad se comparten en la conversación personal.
          </p>
        </div>
      </div>
    </>
  );
}