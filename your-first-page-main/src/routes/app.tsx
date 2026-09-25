import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionPaused } from "@/components/SectionPaused";
import { LandingVideo } from "@/components/app/LandingVideo";
import { useSectionActive } from "@/lib/hooks/useSectionActive";
import { useAppContent, type AppCapture, type AppReview } from "@/lib/hooks/useAppContent";
import silkGold from "@/assets/app/silk-gold.png";
import silkGreen from "@/assets/app/silk-green.png";
import portrait from "@/assets/app/claridad-movil.jpg";
import portraitDesktop from "@/assets/app/claridad-r270.jpg";
import splash from "@/assets/app/splash.jpg";
import chatCarta from "@/assets/app/chat-carta.jpg";
import chatPreguntas from "@/assets/app/chat-preguntas.jpg";

const APP_URL = "https://app.venusedicionlimitada.com";

/** Vacío: el marco enseña las capturas. Con una URL o un archivo, reproduce el vídeo. */
const APP_VIDEO_SRC = "";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Venus App · Cuéntale a Venus" },
      {
        name: "description",
        content:
          "Consulta personalizada de astrología emocional. Tu carta y la sinastría, en conversación. 14 días de demo gratuita.",
      },
      { property: "og:title", content: "Venus App · Conversa a tu Ritmo" },
      {
        property: "og:description",
        content: "Tu carta y la sinastría, a tu ritmo. 14 días de demo gratuita.",
      },
    ],
  }),
  component: VenusAppPage,
});

const STEPS = [
  ["01", "Cuenta", "Entras en la app y creas tu cuenta. Los 14 días de demo empiezan ahí."],
  ["02", "Datos", "Fecha, hora y lugar de nacimiento. Si abres una sinastría, también los de la otra carta."],
  ["03", "Conversación", "Escribes a tu ritmo. Venus no tiene prisa, y puedes volver cuando quieras seguir."],
] as const;

/** Tiempo que cada reseña permanece antes del fundido. */
const REVIEW_HOLD_MS = 3600;

function AccountLink({ className, children }: { className: string; children: string }) {
  return (
    <a href={APP_URL} className={className}>
      {children}
    </a>
  );
}

function ReviewsFade({ reviews }: { reviews: AppReview[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [reviews]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || reviews.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % reviews.length);
    }, REVIEW_HOLD_MS);
    return () => window.clearInterval(id);
  }, [reviews]);

  if (reviews.length === 0) return null;

  return (
    <div className="mt-6 grid text-left">
      {reviews.map((review, i) => (
        <figure
          key={review.id ?? review.name}
          className={`col-start-1 row-start-1 border border-ink/15 px-5 py-4 transition-opacity duration-700 ease-in-out motion-reduce:transition-none md:px-8 md:py-5 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <blockquote className="font-sans text-xl font-normal leading-snug text-ink">{review.quote}</blockquote>
          <figcaption className="mt-4 flex items-end justify-between gap-4 text-[0.7rem] uppercase tracking-[0.22em] text-wine">
            <span>{review.name}</span>
            <span>{review.label}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function VenusAppPage() {
  const sectionActive = useSectionActive("app");
  const { reviews, captures } = useAppContent();
  const frames: AppCapture[] = [
    { id: "splash", src: splash, alt: "Venus, edición limitada. Consulta personalizada de astrología emocional." },
    { id: "carta", src: chatCarta, alt: "Conversación sobre los patrones de pareja en la carta." },
    { id: "preguntas", src: chatPreguntas, alt: "Venus devuelve preguntas para seguir la consulta." },
    ...captures,
  ];
  if (sectionActive === false) return <SectionPaused className="bg-[#1c3329] text-cream" />;

  return (
    <>
      <SiteHeader />

      <section className="bg-[#1c3329] text-cream">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-6 text-center sm:pb-20 sm:pt-10 md:flex md:max-w-6xl md:items-center md:gap-24 md:pb-14 md:pt-12 md:text-left lg:max-w-7xl lg:gap-32">
          <div className="md:w-fit md:shrink-0">
            <div className="mx-auto w-fit md:border md:border-gold/45 md:px-10 md:py-8">
              <p className="flex w-fit flex-col items-end py-10 sm:py-14 md:py-0">
                <span className="font-display text-[4.4rem] leading-none tracking-[0.06em] text-cream sm:text-[6.3rem]">
                  VENUS
                </span>
                <span className="mt-1.5 font-sans text-[0.98rem] leading-none tracking-[0.18em] text-cream sm:text-[1.22rem]">
                  App
                </span>
              </p>
            </div>
            <div className="md:mt-6 md:text-center">
              <p className="eyebrow text-[0.9rem] text-gold sm:text-[1rem]">Tu consulta</p>
              <p className="eyebrow text-[0.9rem] text-gold sm:text-[1rem]">personalizada de</p>
              <p className="eyebrow text-[0.9rem] text-gold sm:text-[1rem]">Astrología emocional</p>
            </div>
          </div>
          <div className="md:min-w-0 md:flex-1">
            <h1 className="mt-10 font-display font-light text-[2.55rem] leading-[1.05] text-cream/80 sm:mt-12 sm:text-4xl md:mt-0 md:translate-y-6 md:text-5xl md:text-center">
              Cuéntale a Venus
            </h1>
            <p className="mt-3 font-sans text-xl leading-tight tracking-[0.2em] text-cream/90 sm:text-2xl md:translate-y-6 md:text-2xl md:text-center">
              a tu propio ritmo
            </p>
            <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-cream/75 sm:max-w-md sm:text-base md:ml-auto md:mr-0 md:w-fit md:max-w-none md:translate-y-8 md:text-center">
              <span className="md:hidden">Tu carta, y la sinastría cuando la pregunta es de dos.</span>
              <span className="hidden md:block">Tu carta,</span>
              <span className="hidden md:block">y la sinastría cuando</span>
              <span className="hidden md:block">la pregunta es de dos</span>
            </p>
            <AccountLink className="app-cta-loop app-cta-loop-strong mt-8 inline-flex w-full max-w-xs items-center justify-center whitespace-nowrap rounded-xl border border-gold bg-granate px-6 py-4 text-xs uppercase tracking-[0.28em] text-cream transition-colors md:mt-12 md:w-auto md:max-w-none md:px-12 md:py-5 md:text-sm md:hover:bg-gold md:hover:text-granate">
              Conoce la App
            </AccountLink>
            <p className="mx-auto mt-4 max-w-xs text-[0.68rem] uppercase leading-relaxed tracking-[0.16em] text-cream/55 md:mx-0 md:max-w-none md:translate-y-10 md:whitespace-nowrap">
              Creas tu cuenta. Introduces tus datos. Resuelves tus dudas.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img
          src={silkGold}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="mx-auto text-center">
            <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
              Así responde Venus
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink/80 sm:text-base md:max-w-2xl lg:max-w-3xl">
              Lees tu carta en conversación. Preguntas por un vínculo, una decisión o esa tensión
              entre lo que piensas y lo que sientes. Ella responde, y te deja la siguiente pregunta.
            </p>
          </div>
          <div className="mt-10">
            <LandingVideo
              src={APP_VIDEO_SRC}
              poster={frames[0].src}
              frames={frames.map(({ src, alt }) => ({ src, alt }))}
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden text-cream">
        <img
          src={silkGreen}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover"
        />
        <div className="absolute inset-0 bg-[#1c3329]/78" />
        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <h2 className="mx-auto max-w-md text-center font-display text-4xl leading-tight sm:text-5xl">
            Tu carta, o la de dos
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <article className="border border-cream/25 bg-[#1c3329]/45 p-6 sm:p-8">
              <p className="eyebrow text-gold">Tu carta</p>
              <h3 className="mt-4 font-display text-3xl">Una consulta que espera</h3>
              <p className="mt-4 text-sm leading-relaxed text-cream/80">
                Venus lee tu carta y conversa sobre lo que estás viviendo. Escribes cuando quieres.
                La respuesta sale de tu mapa, no de un texto genérico.
              </p>
            </article>
            <article className="border border-cream/25 bg-[#1c3329]/45 p-6 sm:p-8">
              <p className="eyebrow text-gold">Sinastría</p>
              <h3 className="mt-4 font-display text-3xl">La carta de dos</h3>
              <p className="mt-4 text-sm leading-relaxed text-cream/80">
                Cuando la pregunta es un vínculo. Venus cruza tu carta con la de otra persona y mira
                lo que ese encuentro activa: patrones de pareja, tensiones y el modo en que os habláis.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-8 text-center sm:pb-20 sm:pt-12 md:max-w-5xl">
          <ol className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 text-left md:snap-none md:items-stretch md:gap-8 md:overflow-visible">
            {STEPS.map(([n, title, body]) => (
              <li key={n} className="w-[82%] shrink-0 snap-center md:w-auto md:min-w-0 md:flex-1 md:snap-align-none">
                <p className="eyebrow text-wine">{n}</p>
                <h3 className="mt-2 font-display text-2xl text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{body}</p>
              </li>
            ))}
          </ol>
          <h2 className="mt-8 text-left font-sans text-xl text-gold sm:mt-10 md:text-2xl">Forman parte del Mundo Venus</h2>
          <ReviewsFade reviews={reviews} />
        </div>
      </section>

      <section className="relative">
        <div className="relative w-full">
          <img src={portrait} alt="" className="block h-auto w-full md:hidden" />
          <img src={portraitDesktop} alt="" className="hidden h-auto w-full md:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[40%] via-[#2c241c]/25 via-[55%] to-[#2c241c]/45" />
          <div className="absolute inset-0">
            <p className="absolute left-1/2 top-[7%] hidden -translate-x-1/2 font-sans text-5xl leading-none tracking-[0.35em] text-cream md:block">
              OBTÉN
            </p>
            <div className="absolute bottom-8 left-1/2 w-full max-w-3xl -translate-x-1/2 px-6 text-center text-cream md:bottom-12 md:max-w-6xl">
              <p className="mb-5 hidden translate-y-4 font-sans text-4xl uppercase leading-none tracking-[0.35em] text-cream md:block">
                CONSULTA CON TU
              </p>
              <h2 className="mx-auto hidden max-w-xl -translate-y-4 font-display text-4xl font-light leading-tight tracking-[0.16em] text-cream/85 sm:max-w-3xl sm:text-5xl md:block md:max-w-none md:text-8xl">
                CARTA ASTRAL
              </h2>
              <p className="hidden -translate-y-4 font-sans text-3xl uppercase leading-none tracking-[0.35em] text-cream/50 md:block">
                ASTROLOGÍA EMOCIONAL APLICADA
              </p>
              <AccountLink className="app-cta-loop inline-flex w-full max-w-xs items-center justify-center rounded-xl border border-gold bg-granate px-6 py-4 text-xs uppercase tracking-[0.28em] text-cream transition-colors md:mx-auto md:mt-8 md:w-auto md:max-w-none md:bg-granate md:px-14 md:py-5 md:text-sm md:hover:bg-gold md:hover:text-granate">
                Conoce la App
              </AccountLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
