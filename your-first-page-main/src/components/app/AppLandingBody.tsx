import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { DOS_CARTA_FRAMES } from "@/components/app/dosCartas";
import { GALLERY_FRAMES } from "@/components/app/galeria";
import { LandingVideo, useReelSwipe } from "@/components/app/LandingVideo";
import { useSectionActive } from "@/lib/hooks/useSectionActive";
import { useAppContent, type AppCapture, type AppGalleryLine, type AppReview } from "@/lib/hooks/useAppContent";
import silkGold from "@/assets/app/silk-gold.png";
import silkGreen from "@/assets/app/silk-green.png";
import portrait from "@/assets/app/claridad-movil.jpg";
import portraitDesktop from "@/assets/app/claridad-r270.jpg";
import splash from "@/assets/app/splash.jpg";

const APP_URL = "https://app.venusedicionlimitada.com";

/** Tiempo que cada reseña permanece antes del fundido. */
const REVIEW_HOLD_MS = 3600;

/** Las frases y las fotos de la galería no comparten ritmo. */
const GALLERY_LINE_MS = 6200;
const GALLERY_PHOTO_MS = 7600;

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
          className={`col-start-1 row-start-1 flex h-full flex-col border border-ink/15 px-5 py-4 transition-opacity duration-700 ease-in-out motion-reduce:transition-none md:px-8 md:py-5 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <blockquote className="font-sans text-[1.05rem] font-normal leading-snug text-ink">{review.quote}</blockquote>
          <figcaption className="mt-auto flex items-end justify-between gap-4 pt-4 text-[0.7rem] uppercase tracking-[0.22em] text-wine">
            <span>{review.name}</span>
            <span>{review.label}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function PauseIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
      <path fill="currentColor" d="M1.5 1h3.2v10H1.5V1zm5.8 0h3.2v10H7.3V1z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
      <path fill="currentColor" d="M2.5 1.2v9.6L11 6 2.5 1.2z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
      <path fill="currentColor" d="M1.2 1.4v9.2L8 6 1.2 1.4zM9.2 1.4H11v9.2H9.2V1.4z" />
    </svg>
  );
}

function galleryOffset(index: number, current: number, total: number) {
  if (total <= 1) return 0;
  let diff = index - current;
  const half = total / 2;
  if (diff > half) diff -= total;
  if (diff < -half) diff += total;
  return diff;
}

function galleryPose(offset: number): CSSProperties {
  const shift = offset === 0 ? 0 : offset * 70;
  const tilt = offset === 0 ? 0 : offset * 9;
  const drop = Math.abs(offset) === 1 ? 5 : Math.abs(offset) > 1 ? 8 : 0;
  const scale = offset === 0 ? 1 : 0.86;
  return {
    transform: `translateX(calc(-50% + ${shift}%)) translateY(${drop}%) rotate(${tilt}deg) scale(${scale})`,
    opacity: offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.42 : 0,
    zIndex: offset === 0 ? 2 : Math.abs(offset) === 1 ? 1 : 0,
  };
}

function MobileHeroLines({ lines }: { lines: AppGalleryLine[] }) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [lines]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced || lines.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % lines.length);
    }, GALLERY_LINE_MS);
    return () => window.clearInterval(id);
  }, [reduced, lines.length]);

  if (lines.length === 0) return null;

  return (
    <div className="mx-auto mt-16 grid max-w-xl sm:mt-20 md:mt-6 md:w-full md:max-w-none md:translate-y-3 md:text-center">
      {lines.map((line, i) => (
        <p
          key={line.id ?? line.body}
          aria-hidden={i !== index}
          className={`col-start-1 row-start-1 text-balance font-sans text-[1.25rem] font-light lowercase leading-[1.22] text-cream/50 transition-opacity duration-700 ease-in-out motion-reduce:transition-none sm:text-[1.05rem] md:text-center md:text-[1.35rem] ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {line.body}
        </p>
      ))}
    </div>
  );
}

function GalleryBlock({ lines, photos }: { lines: AppGalleryLine[]; photos: AppCapture[] }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setPhotoIndex(0);
  }, [photos]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const swipe = useReelSwipe((direction) => {
    setPhotoIndex((current) => (current + direction + photos.length) % photos.length);
  });

  useEffect(() => {
    if (paused || reduced || photos.length < 2) return;
    const id = window.setInterval(() => {
      setPhotoIndex((current) => (current + 1) % photos.length);
    }, GALLERY_PHOTO_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced, photos.length, photoIndex]);

  if (lines.length === 0 && photos.length === 0) return null;

  return (
    <section className="overflow-x-hidden bg-background">
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-8 text-center sm:pb-6 sm:pt-10 md:max-w-6xl lg:max-w-7xl">
        {photos.length > 0 && (
          <div className="mx-auto md:w-[34rem]">
            <div
              className="relative mx-auto aspect-[436/939] w-full max-w-[22rem] touch-pan-y md:aspect-[9/16] md:w-[22rem] md:max-w-none"
              {...(photos.length > 1 ? swipe : {})}
            >
              {photos.map((photo, i) => {
                const offset = galleryOffset(i, photoIndex, photos.length);
                return (
                  <img
                    key={photo.id}
                    src={photo.src}
                    alt={offset === 0 ? photo.alt : ""}
                    style={galleryPose(offset)}
                    className={`absolute left-1/2 top-0 h-full w-full object-contain transition-[transform,opacity] duration-700 ease-out motion-reduce:transition-none ${
                      offset === 0 ? "" : "pointer-events-none"
                    }`}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-center gap-8">
              <button
                type="button"
                onClick={() => setPaused((current) => !current)}
                aria-label={paused ? "Seguir" : "Pausa"}
                className="text-ink/35 transition-colors hover:text-ink/70"
              >
                {paused ? <PlayIcon /> : <PauseIcon />}
              </button>
              <button
                type="button"
                onClick={() => setPhotoIndex((current) => (current + 1) % photos.length)}
                aria-label="Siguiente"
                className="text-ink/35 transition-colors hover:text-ink/70"
              >
                <NextIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ContentRail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  const drag = useRef<{ id: number; x: number; left: number; locked: boolean } | null>(null);

  function onPointerDown(event: PointerEvent<HTMLOListElement>) {
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      left: event.currentTarget.scrollLeft,
      locked: false,
    };
  }

  function onPointerMove(event: PointerEvent<HTMLOListElement>) {
    const current = drag.current;
    const el = ref.current;
    if (!current || !el || event.pointerId !== current.id) return;
    const dx = event.clientX - current.x;
    if (!current.locked) {
      if (Math.abs(dx) < 8) return;
      current.locked = true;
      el.setPointerCapture(event.pointerId);
    }
    el.scrollLeft = current.left - dx;
  }

  function endDrag() {
    drag.current = null;
  }

  return (
    <ol
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="mt-8 flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto pb-4 text-left touch-pan-y active:cursor-grabbing md:mt-8 md:grid md:cursor-auto md:grid-cols-2 md:gap-8 md:overflow-visible md:pb-0 lg:grid-cols-3"
    >
      {children}
    </ol>
  );
}

/** Cuerpo compartido por /app y /landing. El header y el pie los pone cada ruta. */
export function AppLandingBody() {
  const sectionActive = useSectionActive("app");
  const { reviews, cartaCaptures, galleryCaptures, galleryLines, steps } = useAppContent();
  const portada: AppCapture = {
    id: "splash",
    src: splash,
    alt: "Venus, edición limitada. Consulta personalizada de astrología emocional.",
  };
  const cartaFrames: AppCapture[] = [...DOS_CARTA_FRAMES, portada, ...cartaCaptures];
  const galleryPhotos: AppCapture[] = [...GALLERY_FRAMES, ...galleryCaptures];

  if (sectionActive === false) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#1c3329] px-6 text-cream">
        <p className="font-display text-4xl tracking-wide md:text-6xl">Próximamente</p>
      </div>
    );
  }

  return (
    <>
      <section className="bg-[#1c3329] text-cream">
        <div className="mx-auto max-w-3xl px-6 pb-8 pt-8 text-center sm:pb-12 sm:pt-12 md:flex md:max-w-6xl md:items-center md:gap-24 md:pb-14 md:pt-12 md:text-left lg:max-w-7xl lg:gap-32">
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
              <p className="eyebrow text-[0.78rem] text-gold sm:text-[0.85rem] md:text-[1rem]">Tu consulta</p>
              <p className="eyebrow text-[0.78rem] text-gold sm:text-[0.85rem] md:text-[1rem]">personalizada de</p>
              <p className="eyebrow text-[0.78rem] text-gold sm:text-[0.85rem] md:text-[1rem]">Astrología emocional</p>
            </div>
          </div>
          <div className="md:min-w-0 md:flex-1">
            <h1
              className="mt-10 text-[2.8rem] font-light leading-[1.05] text-cream/80 sm:mt-12 sm:text-[2.5rem] md:mt-0 md:translate-y-6 md:text-[3.1rem] md:text-center"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 300, fontStyle: "italic" }}
            >
              Cuéntale a Venus
            </h1>
            <MobileHeroLines lines={galleryLines} />
            <AccountLink className="app-cta-loop app-cta-loop-strong mt-16 inline-flex w-full max-w-xs items-center justify-center whitespace-nowrap rounded-xl border border-gold bg-granate px-6 py-4 text-xs uppercase tracking-[0.28em] text-cream transition-colors sm:mt-20 md:mt-12 md:translate-y-10 md:w-auto md:max-w-none md:px-12 md:py-5 md:text-sm md:hover:bg-gold md:hover:text-granate">
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
          className="pointer-events-none absolute inset-0 h-full w-full scale-150 object-cover blur-md"
        />
        <div className="absolute inset-0 bg-cream/25" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:py-20 md:py-24">
          <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">Clima Astral</h2>
          <p className="mx-auto mt-6 max-w-xl text-[1.075rem] font-normal leading-relaxed text-ink sm:text-[1.2rem] md:mt-8 md:text-[1.65rem] md:leading-[1.3]">
            ¿Tienes un evento importante?
          </p>
          <p className="mx-auto mt-3 max-w-xl text-[1.075rem] font-normal leading-relaxed text-ink sm:text-[1.2rem] md:text-[1.65rem] md:leading-[1.3]">
            Venus te dice al instante, cómo será para ti la energía de ese día
          </p>
          <p className="mx-auto mt-8 max-w-md text-[0.68rem] font-normal uppercase leading-relaxed tracking-[0.12em] text-ink/70 md:tracking-[0.16em]">
            <span className="md:hidden">
              <span className="block">La energía del día</span>
              <span className="mt-1 block">y la energía aplicada a tu carta</span>
            </span>
            <span className="hidden md:inline">La energía del día — La energía aplicada a tu carta</span>
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden text-cream">
        <img
          src={silkGreen}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover"
        />
        <div className="absolute inset-0 bg-[#1c3329]/78" />
        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24 md:flex md:max-w-6xl md:flex-row-reverse md:items-start md:gap-20 md:py-28 lg:gap-28">
          <div className="min-w-0 md:flex-1">
            <h2 className="mx-auto max-w-md text-center font-display text-4xl leading-tight sm:text-5xl md:mx-0 md:max-w-none md:text-left">
              <span className="block md:inline">Tu carta,</span>{" "}
              <span className="block md:inline">o la de dos</span>
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
            <p className="mx-auto mt-16 hidden max-w-none text-left font-extralight leading-relaxed text-cream md:block md:text-[1.05rem] md:leading-[1.4] lg:text-[1.1rem]">
              Lees tu carta en conversación. Preguntas por un vínculo, una decisión o esa tensión
              entre lo que piensas y lo que sientes. Ella responde, y te deja la siguiente pregunta.
            </p>
          </div>
          <div className="mt-10 w-full md:mt-0 md:w-[22rem] md:shrink-0">
            <LandingVideo
              poster={cartaFrames[0].src}
              frames={cartaFrames.map(({ src, alt }) => ({ src, alt }))}
            />
            <p className="mx-auto mt-8 max-w-xl text-center text-[0.975rem] font-normal leading-relaxed text-cream sm:text-[1.1rem] md:hidden">
              Lees tu carta en conversación. Preguntas por un vínculo, una decisión o esa tensión
              entre lo que piensas y lo que sientes. Ella responde, y te deja la siguiente pregunta.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-6 pb-10 pt-10 sm:pb-14 sm:pt-12 md:max-w-5xl md:pb-20 md:pt-12">
          <h2 className="text-left font-display text-3xl leading-tight text-ink sm:text-4xl">
            Con tus datos de nacimiento tendrás
          </h2>
          <ContentRail>
            {steps.map((step) => (
              <li key={step.id ?? step.marker} className="w-[82%] shrink-0 snap-center md:w-auto md:min-w-0">
                <p className="eyebrow tracking-[0.14em] text-wine">{step.marker}</p>
                <h3 className="mt-2 font-sans text-xl font-semibold leading-snug text-ink">{step.title}</h3>
                {step.body ? (
                  <p className="mt-2 font-sans text-base font-light leading-relaxed text-ink md:text-ink/75">{step.body}</p>
                ) : null}
              </li>
            ))}
          </ContentRail>
        </div>
      </section>

      <GalleryBlock lines={galleryLines} photos={galleryPhotos} />

      <section className="relative">
        <div className="relative w-full">
          <img src={portrait} alt="" className="block h-auto w-full md:hidden" />
          <img src={portraitDesktop} alt="" className="hidden h-auto w-full md:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[40%] via-[#2c241c]/25 via-[55%] to-[#2c241c]/45" />
          <div className="absolute inset-0">
            <p className="absolute left-1/2 top-[7%] hidden -translate-x-1/2 font-sans text-5xl leading-none tracking-[0.35em] text-cream md:block">
              OBTÉN
            </p>
            <div className="absolute bottom-5 left-1/2 w-full max-w-3xl -translate-x-1/2 px-6 text-center text-cream md:bottom-12 md:max-w-6xl">
              <p className="mb-5 hidden translate-y-4 font-sans text-4xl uppercase leading-none tracking-[0.35em] text-cream md:block">
                CONSULTA CON TU
              </p>
              <h2 className="mx-auto hidden max-w-xl -translate-y-4 font-display text-4xl font-light leading-tight tracking-[0.16em] text-cream/85 sm:max-w-3xl sm:text-5xl md:block md:max-w-none md:text-8xl">
                CARTA ASTRAL
              </h2>
              <p className="hidden -translate-y-4 font-sans text-3xl uppercase leading-none tracking-[0.35em] text-cream/50 md:block">
                ASTROLOGÍA EMOCIONAL APLICADA
              </p>
              <AccountLink className="app-cta-loop inline-flex w-auto items-center justify-center rounded-2xl border border-gold bg-granate px-3 py-2.5 text-xs uppercase tracking-[0.28em] text-cream transition-colors md:mx-auto md:mt-8 md:w-auto md:rounded-xl md:bg-granate md:px-14 md:py-5 md:text-sm md:hover:bg-gold md:hover:text-granate">
                Conoce la App
              </AccountLink>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-8 text-center sm:pb-20 sm:pt-12 md:max-w-5xl">
          <h2 className="text-left font-sans text-[1.15rem] text-gold sm:mt-10 md:text-[1.4rem]">Forman parte del Mundo Venus</h2>
          <ReviewsFade reviews={reviews} />
        </div>
        <div className="section-forest h-8" aria-hidden="true" />
      </section>
    </>
  );
}
