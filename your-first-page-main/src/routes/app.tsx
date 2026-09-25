import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SectionPaused } from "@/components/SectionPaused";
import { LandingVideo } from "@/components/app/LandingVideo";
import { useSectionActive } from "@/lib/hooks/useSectionActive";
import logo from "@/assets/app/logo.png";
import silkGold from "@/assets/app/silk-gold.png";
import silkGreen from "@/assets/app/silk-green.png";
import portrait from "@/assets/app/portrait.png";
import splash from "@/assets/app/splash.jpg";
import chatCarta from "@/assets/app/chat-carta.jpg";
import chatPreguntas from "@/assets/app/chat-preguntas.jpg";

const APP_URL = "https://app.venusedicionlimitada.com";

/** Vacío: el marco enseña las capturas. Con una URL o un archivo, reproduce el vídeo. */
const APP_VIDEO_SRC = "";

// Placeholder: sustituir por reseñas reales antes de publicar.
const reviews = [
  {
    quote: "Le escribí de noche, sin preparar nada. Venus me devolvió el patrón del vínculo, no un consejo.",
    name: "Marta",
  },
  {
    quote: "Abrí la sinastría y por fin vi la carta de los dos en la misma conversación.",
    name: "Lucía",
  },
  {
    quote: "Puedo parar y volver. No es una sesión con hora: es mi carta, cuando yo quiero seguir.",
    name: "Elena",
  },
];

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Venus App · Conversa a tu ritmo" },
      {
        name: "description",
        content:
          "Consulta personalizada de astrología emocional. Tu carta y la sinastría, en conversación. 14 días de demo gratuita.",
      },
      { property: "og:title", content: "Venus App · Cuéntale a Venus" },
      {
        property: "og:description",
        content: "Tu carta y la sinastría, a tu ritmo. 14 días de demo gratuita.",
      },
    ],
  }),
  component: VenusAppPage,
});

function AccountLink({ className, children }: { className: string; children: string }) {
  return (
    <a href={APP_URL} className={className}>
      {children}
    </a>
  );
}

function VenusAppPage() {
  const sectionActive = useSectionActive("app");
  if (sectionActive === false) return <SectionPaused className="bg-[#1c3329] text-cream" />;

  return (
    <>
      <SiteHeader />

      <section className="bg-[#1c3329] text-cream">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-6 text-center sm:pb-20 sm:pt-10">
          <img
            src={logo}
            alt="Venus App"
            className="mx-auto h-52 w-full max-w-sm object-cover object-center sm:h-64 sm:max-w-md"
          />
          <p className="eyebrow text-gold">Astrología emocional</p>
          <h1 className="mt-5 font-display text-[2.55rem] leading-[1.05] text-cream sm:text-6xl">
            Conversa a tu ritmo.
          </h1>
          <p className="mt-3 font-display text-[1.85rem] italic leading-tight text-cream/90 sm:text-4xl">
            Cuéntale a Venus.
          </p>
          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-cream/75 sm:max-w-md sm:text-base">
            Tu consulta personalizada. Tu carta, y la sinastría cuando la pregunta es de dos.
          </p>
          <AccountLink className="mt-8 inline-flex w-full max-w-xs items-center justify-center border border-gold px-6 py-4 text-xs uppercase tracking-[0.28em] text-cream transition-colors hover:bg-gold hover:text-[#1c3329]">
            Empezar 14 días gratis
          </AccountLink>
          <p className="mx-auto mt-4 max-w-xs text-[0.68rem] uppercase leading-relaxed tracking-[0.16em] text-cream/55">
            Creas tu cuenta e introduces tus datos
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img
          src={silkGold}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover"
        />
        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-md text-center">
            <p className="eyebrow text-wine">La consulta</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
              Así responde Venus
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/80 sm:text-base">
              Lees tu carta en conversación. Preguntas por un vínculo, una decisión o esa tensión
              entre lo que piensas y lo que sientes. Ella responde, y te deja la siguiente pregunta.
            </p>
          </div>
          <div className="mt-10">
            <LandingVideo
              src={APP_VIDEO_SRC}
              poster={splash}
              frames={[
                { src: splash, alt: "Venus, edición limitada. Consulta personalizada de astrología emocional." },
                { src: chatCarta, alt: "Conversación sobre los patrones de pareja en la carta." },
                { src: chatPreguntas, alt: "Venus devuelve preguntas para seguir la consulta." },
              ]}
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
          <p className="eyebrow text-center text-gold">Dos maneras de entrar</p>
          <h2 className="mx-auto mt-4 max-w-md text-center font-display text-4xl leading-tight sm:text-5xl">
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
        <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
          <p className="eyebrow text-gold">Cómo empieza</p>
          <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">Tres pasos, y la conversación</h2>
          <ol className="mx-auto mt-10 max-w-md space-y-8 text-left">
            {[
              ["01", "Cuenta", "Entras en la app y creas tu cuenta. Los 14 días de demo empiezan ahí."],
              ["02", "Datos", "Fecha, hora y lugar de nacimiento. Si abres una sinastría, también los de la otra carta."],
              ["03", "Conversación", "Escribes a tu ritmo. Venus no tiene prisa, y puedes volver cuando quieras seguir."],
            ].map(([n, title, body]) => (
              <li key={n} className="border-t border-ink/15 pt-6">
                <p className="eyebrow text-wine">{n}</p>
                <h3 className="mt-2 font-display text-2xl text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-forest">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
          <p className="eyebrow text-center text-gold">Reseñas</p>
          <h2 className="mt-4 text-center font-display text-4xl sm:text-5xl">Quien ya le ha escrito</h2>
          <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
            {reviews.map((review) => (
              <figure
                key={review.name}
                className="w-[82%] shrink-0 snap-center border border-cream/20 p-6 sm:w-auto"
              >
                <blockquote className="font-display text-xl leading-snug text-cream">{review.quote}</blockquote>
                <figcaption className="mt-6 text-[0.7rem] uppercase tracking-[0.22em] text-gold">
                  {review.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[88vh] overflow-hidden">
        <img
          src={portrait}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover object-[center_18%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c3329] via-[#1c3329]/55 to-[#1c3329]/15" />
        <div className="relative flex min-h-[88vh] flex-col items-center justify-end px-6 pb-16 text-center text-cream">
          <p className="eyebrow text-gold">14 días</p>
          <h2 className="mt-4 max-w-sm font-display text-4xl leading-tight sm:max-w-lg sm:text-5xl">
            Catorce días para contarle a Venus lo que no cabe en una sesión.
          </h2>
          <AccountLink className="mt-8 inline-flex w-full max-w-xs items-center justify-center border border-cream bg-cream px-6 py-4 text-xs uppercase tracking-[0.28em] text-[#1c3329] transition-colors hover:bg-transparent hover:text-cream">
            Crear cuenta
          </AccountLink>
          <p className="mt-4 text-[0.68rem] uppercase tracking-[0.16em] text-cream/70">
            Demo gratuita · app.venusedicionlimitada.com
          </p>
        </div>
      </section>
    </>
  );
}
