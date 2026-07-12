import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "../assets/hero-venus.jpg";
import { SiteHeader } from "../components/SiteHeader";
import { LunarWidget } from "../components/LunarWidget";

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

function Index() {
  return (
    <>
      {/* 1. Franja inicial */}
      <section className="section-forest relative w-full py-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <span className="font-['Cormorant_Garamond'] text-[2.8rem] text-cream/80 tracking-widest uppercase leading-none">
            VENUS
          </span>
          <span className="font-sans text-[0.8rem] text-cream/80 tracking-[0.2em] uppercase leading-none mt-0 translate-x-[5px] translate-y-[-1px]">
            EDICIÓN LIMITADA
          </span>
        </div>
      </section>

      {/* 2. Menú manual */}
      <SiteHeader />

{/* 3. Hero — fondo crema seda */}
      <section className="section-cream relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Composición sensorial: seda crema, flor blanca y carta astral dorada"
            width={1600}
            height={1200}
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-cream/60 to-cream" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-0 pb-32 text-right translate-x 40 md:pt-10 md:pb-44">
          <p className="eyebrow text-wine text-xl">Astrología·Emocional</p>
          
          <div className="relative w-162 mx-auto mt-10 mb-10 -translate-x-90 -translate-y-30">
            {/* Modifica el valor de scale(1) para cambiar el tamaño en porcentaje (ej: scale(0.85)) */}
            <div style={{ transform: "scale(0.85)", transformOrigin: "center" }}>
              <LunarWidget />
            </div>
          </div>
          
          <h1 className="mt-8 font-display text-[4rem] leading-[0.95] text-ink md:text-[6rem] lg:text-[7rem]">
            VENUS
          </h1>
          <p className="eyebrow mt-5 text-ink/70 text-xl translate-x-3 -translate-y-1">
            Edición Limitada
          </p>
          <p className="mx-auto mt-10 max-w-xl text-base leading-relaxed text-ink/80 md:text-lg">
            Terapias de acompañamiento donde el cuerpo, los astros y la palabra
            se reúnen para sostener tu proceso.
          </p>
          


          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
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

      {/* Filosofía — fondo blanco */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
        <p className="eyebrow text-clay">Filosofía</p>
        <p className="mt-8 font-display text-2xl italic leading-relaxed text-ink md:text-4xl">
          "Habitar el cuerpo como quien habita un templo, leer los astros como
          quien lee un mapa de regreso a casa."
        </p>
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