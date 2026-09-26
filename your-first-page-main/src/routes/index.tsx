import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "../assets/hero-venus.jpg";
import lunarBg from "../assets/Venus_02.jpg";
import { SiteHeader } from "../components/SiteHeader";
import { LunarEventCard } from "../components/LunarEventCard";
import { SideRecommendImage } from "../components/SideRecommendImage";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { HomeFeatureCard } from "@/components/cards/HomeFeatureCard";
import { supabase } from "@/integrations/supabase/client";
import { EmotionalCategoryCard, tarjetasDeEmocion, type EmotionFicha } from "@/components/events/EmotionalCategoryCard";
import { sectionIsOpen, useSectionFlags } from "@/lib/hooks/useSectionActive";
import { LandingVideo } from "@/components/app/LandingVideo";
import silkGreen from "@/assets/app/silk-green.png";
import splash from "@/assets/app/splash.jpg";
import chatCarta from "@/assets/app/chat-carta.jpg";
import chatPreguntas from "@/assets/app/chat-preguntas.jpg";

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

const HOME_CAROUSEL_LIMIT = 5;

const PILLARS = [
  { eyebrow: "I", title: "Yoga", body: "Secuencias conscientes para escuchar el cuerpo y soltar lo que pesa." },
  { eyebrow: "II", title: "Astrología", body: "Lectura de carta como herramienta de autoconocimiento y dirección." },
  { eyebrow: "III", title: "Acompañamiento", body: "Sesiones personales tejidas a tu momento y a tu pregunta." },
];

const SECTION_LABEL = {
  diario: "Reflexiones",
  yoga: "Yoga",
  astrologia: "Astrología",
} as const;

type Seccion = keyof typeof SECTION_LABEL;

type Post = {
  id: string;
  slug: string;
  date_label: string;
  title: string;
  description: string;
  body: string | null;
  cover_image_url: string | null;
  tarjetas: string;
  seccion: Seccion;
  created_at: string;
  active: boolean;
};

const CAROUSEL_SOURCES: { seccion: Seccion; table: string }[] = [
  { seccion: "reflexiones", table: "diary_entries" },
  { seccion: "yoga", table: "yoga_articles" },
  { seccion: "astrologia", table: "astrology_articles" },
];

function toPost(row: Record<string, unknown>, seccion: Seccion): Post {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    date_label: String(row.date_label ?? ""),
    title: String(row.title ?? ""),
    description: String(row.description ?? row.excerpt ?? ""),
    body: (row.body as string | null) ?? null,
    cover_image_url: (row.cover_image_url as string | null) ?? null,
    tarjetas: String(row.tarjetas ?? row.tag ?? row.tarjeta ?? ""),
    seccion,
    created_at: String(row.created_at ?? ""),
    active: row.active !== false,
  };
}

function Index() {
  const [lunarCoverUrl, setLunarCoverUrl] = useState<string | null>(null);
  const [api, setApi] = useState<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [fichas, setFichas] = useState<EmotionFicha[]>([]);
  const [items, setItems] = useState<Post[] | null>(null);
  const sectionFlags = useSectionFlags();

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      CAROUSEL_SOURCES.map(async ({ seccion, table }) => {
        const { data, error } = await supabase
          .from(table as "diary_entries")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(HOME_CAROUSEL_LIMIT);

        if (error) {
          console.error(`[home carousel] ${table}:`, error.message);
          return [] as Post[];
        }

        return (data ?? []).map((row) => toPost(row as Record<string, unknown>, seccion));
      }),
    ).then((groups) => {
      if (cancelled) return;
      const merged = groups
        .flat()
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, HOME_CAROUSEL_LIMIT);
      setItems(merged);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    supabase
      .from("lunar_events")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setEvents(data ?? []));
  }, []);

  useEffect(() => {
    supabase
      .from("emociones")
      .select("nombre, subtitulo, extracto, descripcion, cover_image_url")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setFichas((data ?? []) as EmotionFicha[]));
  }, []);

  const categories = useMemo(
    () => tarjetasDeEmocion(events, fichas),
    [events, fichas],
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

      {/* NUEVO BLOQUE MODULAR */}
      <section className="section-yoga relative w-full overflow-hidden py-12 md:py-16">
        <img
          src={lunarBg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover"
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-start gap-8 w-full">
            <div className="flex-1 w-full">
              <LunarEventCard onCoverUrl={setLunarCoverUrl} />
            </div>
            <SideRecommendImage src={lunarCoverUrl} />
          </div>
        </div>
      </section>

      {/* Pilares — fondo verde bosque (max-w-6xl) */}
      <section className="section-forest">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-12 md:pt-16 md:pb-16">
          <div className="text-center">
            <p className="eyebrow text-lg tracking-[0.08em] text-gold">ASTROLOGÍA EMOCIONAL</p>
            <h2 className="eyebrow mt-6 tracking-[0.08em] text-cream/85 md:text-lg">
              Una práctica tejida a mano.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream/80 md:mt-3 md:w-full md:max-w-none md:text-base">
              Yoga, astrología y acompañamiento se entrelazan para sostener tu
              proceso: el cuerpo, la carta y la conversación como un mismo
              ritual de escucha.
            </p>
          </div>

          <div className="mt-2 hidden md:grid md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="px-10">
                <p className="eyebrow text-gold">{p.eyebrow}</p>
                <div className="relative">
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="absolute top-0 bottom-0 -left-10 w-px bg-cream/15"
                    />
                  )}
                  <h3 className="font-display text-3xl text-cream">{p.title}</h3>
                  <p className="mt-4 pb-8 text-sm leading-relaxed text-cream/80">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarjetas dinámicas — categorías emocionales del bloque de pilares */}
      {categories.length > 0 && (
        <section className="section-forest">
          <div className="mx-auto max-w-5xl px-6 pb-24 md:pb-32">
            <div className="md:hidden">
              <Carousel
                opts={{
                  align: "center",
                  loop: false,
                  containScroll: false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {categories.map((cat) => (
                    <CarouselItem key={cat.nombre} className="pl-4 basis-[82%]">
                      <EmotionalCategoryCard cat={cat} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="hidden md:grid gap-6 md:grid-cols-3">
              {categories.map((cat) => (
                <EmotionalCategoryCard key={cat.nombre} cat={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Carrusel de contenido */}
      <section className="w-full bg-white pt-5 pb-6 md:pt-7 md:pb-8 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-6 text-center md:mb-8">
            <p className="eyebrow tracking-[0.16em] text-clay">Contenido recomendado</p>
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
                opts={{ 
                  align: isMobile ? "center" : "start", 
                  loop: !isMobile, 
                  containScroll: isMobile ? false : "trimSnaps" 
                }} 
                className="w-full max-w-6xl mx-auto transition-transform duration-300"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {items.map((p, index) => {
                    const isActive = index === currentIndex;
                    return (
                      <CarouselItem 
                        key={`${p.seccion}-${p.id}`} 
                        className={`pl-2 md:pl-4 basis-[240px] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 flex justify-center relative transition-all duration-300 ${
                          isMobile 
                            ? (isActive ? "opacity-100 scale-100 z-30" : "opacity-60 scale-95 z-10")
                            : "opacity-100 scale-100"
                        }`}
                      >
                        <HomeFeatureCard
                          item={{ ...p, active: p.active !== false && sectionIsOpen(sectionFlags, p.seccion) }}
                          linkTo="/$seccion/$slug"
                          linkParams={{ seccion: p.seccion, slug: p.slug }}
                          tagLabel={SECTION_LABEL[p.seccion]}
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

      {/* 3. Hero Visual */}
      <section className="section-cream relative overflow-hidden h-[6vh] sm:h-[8vh]">
        <img
          src={heroImage}
          alt="Composición sensorial"
          width={1600}
          height={1200}
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-cream/60 to-cream" />
      </section>

      {/* 4. Bloque de Introducción */}
      <section className="section-cream pt-4 pb-8 sm:pt-14 sm:pb-6 text-center">
        <div className="relative mx-auto max-w-7xl px-6">
          <p className="eyebrow text-base tracking-[0.08em] text-wine sm:text-xl">
            Astrología·Emocional
          </p>
        </div>
      </section>

      {/* 5. Bloque de Contenido */}
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

      {sectionIsOpen(sectionFlags, "app") && (
        <section className="relative overflow-hidden text-cream">
          <img
            src={silkGreen}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover"
          />
          <div className="absolute inset-0 bg-[#1c3329]/78" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-16 pt-10 text-center sm:pb-20 sm:pt-12 lg:grid lg:max-w-7xl lg:grid-cols-[minmax(0,1fr)_22rem_minmax(0,1fr)] lg:items-center lg:gap-x-8 lg:px-8 xl:gap-x-12">
            <p className="eyebrow text-xl tracking-[0.16em] text-gold sm:text-2xl lg:hidden">Venus App</p>
            <div className="lg:col-start-3 lg:row-start-1 lg:px-2">
              <h2 className="mt-10 font-display text-4xl font-light leading-tight text-cream/80 sm:mt-12 sm:text-5xl lg:mt-0">Cuéntale a Venus</h2>
              <p className="mt-1 font-sans text-xl leading-tight tracking-[0.04em] text-cream/90 sm:text-2xl lg:mt-3">a tu propio ritmo</p>
              <div className="mt-6 text-center lg:hidden">
                <p className="eyebrow text-[0.75rem] leading-[1.9] tracking-[0.25em] text-gold sm:text-[0.85rem]">Tu consulta</p>
                <p className="eyebrow text-[0.75rem] leading-[1.9] tracking-[0.25em] text-gold sm:text-[0.85rem]">personalizada de</p>
                <p className="eyebrow text-[0.75rem] leading-[1.9] tracking-[0.25em] text-gold sm:text-[0.85rem]">Astrología emocional</p>
              </div>
              <div className="mx-auto mt-9 hidden max-w-xs lg:block">
                <p className="font-sans text-base italic leading-[1.85] text-cream/75">Tu carta,</p>
                <p className="font-sans text-base italic leading-[1.85] text-cream/75">y si la pregunta es de dos,</p>
                <p className="font-sans text-base italic leading-[1.85] text-cream/75">la sinastría</p>
              </div>
              <a
                href="https://app.venusedicionlimitada.com"
                className="app-cta-loop app-cta-loop-strong mt-10 hidden items-center justify-center rounded-3xl border border-gold bg-granate px-10 py-4 text-sm uppercase tracking-[0.28em] text-cream transition-colors hover:bg-gold hover:text-granate lg:inline-flex"
              >
                Ir a la App
              </a>
              <p className="mt-4 hidden font-sans text-sm leading-relaxed text-cream/75 lg:block">14 DÍAS DE PRUEBA GRATUITA</p>
            </div>
            <div className="mt-10 w-full lg:col-start-2 lg:row-start-1 lg:mt-0 lg:w-[22rem]">
              <LandingVideo
                src=""
                poster={splash}
                frames={[
                  { src: splash, alt: "Venus, edición limitada. Consulta personalizada de astrología emocional." },
                  { src: chatCarta, alt: "Conversación sobre los patrones de pareja en la carta." },
                  { src: chatPreguntas, alt: "Venus devuelve preguntas para seguir la consulta." },
                ]}
              />
            </div>
            <a
              href="https://app.venusedicionlimitada.com"
              className="app-cta-loop mt-12 inline-flex w-auto items-center justify-center rounded-2xl border border-gold bg-granate px-6 py-2.5 text-xs uppercase tracking-[0.28em] text-cream transition-colors md:app-cta-loop-strong md:hover:bg-gold md:hover:text-granate lg:hidden"
            >
              Ir a la App
            </a>
            <p className="mt-4 font-sans text-sm leading-relaxed text-cream/75 lg:hidden">14 DÍAS DE PRUEBA GRATUITA</p>
            <div className="hidden lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col lg:items-center">
              <div className="w-fit border border-gold/45 px-7 py-6 xl:px-10 xl:py-8">
                <p className="flex w-fit flex-col items-end">
                  <span className="font-display text-[3.15rem] leading-none tracking-[0.06em] text-cream xl:text-[4.35rem]">
                    VENUS
                  </span>
                  <span className="mt-1.5 font-sans text-[0.9rem] leading-none tracking-[0.18em] text-cream xl:text-[1.12rem]">
                    App
                  </span>
                </p>
              </div>
              <div className="mt-12 text-center xl:mt-14">
                <p className="eyebrow text-[0.95rem] leading-[1.9] tracking-[0.25em] text-gold xl:text-[1.1rem] xl:leading-[2]">Tu consulta</p>
                <p className="eyebrow text-[0.95rem] leading-[1.9] tracking-[0.25em] text-gold xl:text-[1.1rem] xl:leading-[2]">personalizada de</p>
                <p className="eyebrow text-[0.95rem] leading-[1.9] tracking-[0.25em] text-gold xl:text-[1.1rem] xl:leading-[2]">Astrología emocional</p>
              </div>
            </div>
          </div>
        </section>
      )}

    </>
  );
}