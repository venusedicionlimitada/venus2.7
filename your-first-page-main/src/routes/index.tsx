import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "../assets/hero-venus.jpg";
import { SiteHeader } from "../components/SiteHeader";
import { LunarEventCard } from "../components/LunarEventCard";
import { SideRecommendImage } from "../components/SideRecommendImage";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { HomeFeatureCard } from "@/components/cards/HomeFeatureCard";
import { useContentData } from "@/lib/hooks/useContentData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VENUS Edición Limitada · Yoga, astrología y acompañamiento" },
      { name: "description", content: "Un espacio ritual donde el yoga y la astrología se entrelazan para acompañarte en tu proceso de transformation." },
      { property: "og:title", content: "VENUS Edición Limitada" },
      { property: "og:description", content: "Terapias de acompañamiento desde el yoga y la astrología." },
    ],
  }),
  component: Index,
});

type Post = {
  id: string; 
  slug: string;
  date_label: string; 
  title: string; 
  description: string; 
  body: string | null; 
  cover_image_url: string | null;
  tarjetas: string;
};

function Index() {
  const [lunarCoverUrl, setLunarCoverUrl] = useState<string | null>(null);
  const [api, setApi] = useState<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { items } = useContentData<Post>("diary_entries", 7);

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <>
      {/* 1. Franja inicial */}
      <section className="section-forest relative w-full py-6 sm:py-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <span className="font-display text-[2rem] sm:text-[2.8rem] text-cream/80 tracking-widest uppercase leading-none">
            VENUS
          </span>
          <span className="font-sans text-[0.65rem] sm:text-[0.8rem] text-cream/80 tracking-[0.2em] uppercase leading-none mt-2 sm:mt-3 translate-x-[5px]">
            EDICIÓN LIMITADA
          </span>
        </div>
      </section>

      {/* 2. Menú manual */}
      <SiteHeader />

      {/* NUEVO BLOQUE MODULAR: Relleno p-8 añadido a themeClasses para empujar el texto hacia dentro */}
      <section className="section-forest w-full py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-start gap-8 w-full">
            
            {/* Columna de la tarjeta adaptada al espacio disponible */}
            <div className="flex-1 w-full">
              <LunarEventCard onCoverUrl={setLunarCoverUrl} />
            </div>

            <SideRecommendImage src={lunarCoverUrl} />

          </div>
        </div>
      </section>

      {/* 3. Hero Visual con altura reducida */}
      <section className="section-cream relative overflow-hidden h-[6vh] sm:h-[8vh]">
        <img
          src={heroImage}
          alt="Composición sensorial: seda crema, flor blanca y carta astral dorada"
          width={1600}
          height={1200}
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-cream/60 to-cream" />
      </section>

      {/* 4. Bloque de Introducción — Cabecera de Astrología Emocional */}
      <section className="section-cream pt-4 pb-8 sm:pt-14 sm:pb-6 text-center">
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="eyebrow text-base tracking-[0.2em] text-wine sm:text-xl sm:tracking-[0.35em]">
            Astrología·Emocional
          </p>
        </div>
      </section>

      {/* 5. Bloque de Contenido — Texto principal y botones */}
      <section className="section-cream pt-4 pb-20 sm:pt-6 sm:pb-28 text-center">
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="mx-auto max-w-xl text-base leading-relaxed text-ink/80 md:text-lg">
            Terapias de acompañamiento donde el cuerpo, los astros y la palabra
            se reúnen para sostener tu proceso.
          </p>

          <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/servicios"
              className="border border-wine bg-wine px-8 py-4 text-xs uppercase tracking-[0.3em] text-cream transition-colors hover:bg-transparent hover:text-wine"
            >
              Explorar las terapias
            </Link>
            <Link
              to="/recursos"
              className="border border-ink/40 px-8 py-4 text-xs uppercase tracking-[0.3em] text-ink/80 transition-colors hover:border-ink hover:text-ink"
            >
              Recursos gratuitos
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Bloque de Diario — Fondo blanco puro */}
      <section className="w-full bg-white pt-2 pb-6 md:pt-4 md:pb-8 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-6">
            <p className="eyebrow text-clay">Contenido</p>
            <h2 className="hidden mt-2 font-display text-2xl text-ink md:text-3xl font-light">
              Explora nuestro contenido
            </h2>
          </div>

          {!items ? (
            <p className="text-center text-sm text-ink/60">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-ink/60">Pronto.</p>
          ) : (
            <div className="relative px-0 flex justify-center">
              <Carousel 
                setApi={setApi}
                opts={{ align: "center", loop: false, containScroll: false }} 
                className="w-full max-w-6xl mx-auto transition-transform duration-300"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {items.map((p, index) => {
                    const isActive = index === currentIndex;
                    return (
                      <CarouselItem 
                        key={p.id} 
                        className={`pl-2 md:pl-4 basis-[240px] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 flex justify-center relative transition-all duration-300 ${
                          isActive 
                            ? "opacity-100 scale-100 z-30" 
                            : "opacity-60 scale-95 md:opacity-100 md:scale-100 z-10"
                        }`}
                      >
                        <HomeFeatureCard
                          item={p}
                          linkTo="/diario/$slug"
                          linkParams={{ slug: p.slug }}
                          tagLabel="Diario"
                          themeClasses="bg-transparent hover:bg-cream/45 border border-gold hover:border-gold text-ink transition-colors"
                        />
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>

                <div className="hidden md:block">
                  <CarouselPrevious className="absolute -left-12 lg:-left-16 top-1/2 -translate-y-1/2 bg-transparent border-ink/20 text-ink hover:bg-ink/5 size-10 lg:size-12" />
                  <CarouselNext className="absolute -right-12 lg:-right-16 top-1/2 -translate-y-1/2 bg-transparent border-ink/20 text-ink hover:bg-ink/5 size-10 lg:size-12" />
                </div>
              </Carousel>
            </div>
          )}
        </div>
      </section>

      {/* Pilares — fondo verde bosque */}
      <section className="section-forest">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mb-16 text-center">
            <p className="eyebrow text-gold">Tres pilares</p>
            <h2 className="mt-6 font-display text-4xl text-cream md:text-5xl">
              Una práctica tejida a mano.
            </h2>
          </div>
          <div className="grid gap-px bg-cream/15 md:grid-cols-3">
            {[
              { eyebrow: "I", title: "Yoga", body: "Secuencias conscientes para escuchar el cuerpo y soltar lo que pesa." },
              { eyebrow: "II", title: "Astrología", body: "Lectura de carta como herramienta de autoconocimiento y dirección." },
              { eyebrow: "III", title: "Acompañamiento", body: "Sesiones personales tejidas a tu momento y a tu pregunta." },
            ].map((p) => (
              <div key={p.title} className="section-forest p-10">
                <p className="eyebrow text-gold">{p.eyebrow}</p>
                <h3 className="mt-6 font-display text-3xl text-cream">{p.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-cream/80">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final — fondo blanco */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
        <p className="eyebrow text-clay">¿Empezamos?</p>
        <h2 className="mt-6 font-display text-4xl text-ink md:text-5xl">
          Cada proceso comienza con una conversación.
        </h2>
        <Link
          to="/contacto"
          className="mt-10 inline-block border border-wine bg-wine px-10 py-4 text-xs uppercase tracking-[0.3em] text-cream hover:bg-transparent hover:text-wine transition-colors"
        >
          Escríbeme
        </Link>
      </section>
    </>
  );
}