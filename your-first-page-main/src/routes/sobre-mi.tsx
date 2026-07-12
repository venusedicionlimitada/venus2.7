import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader";

export const Route = createFileRoute("/sobre-mi")({
  head: () => ({
    meta: [
      { title: "Sobre mí · Venus Edición Limitada" },
      { name: "description", content: "Quién está detrás de Venus: una práctica que une yoga, astrología y acompañamiento terapéutico." },
      { property: "og:title", content: "Sobre mí · Venus" },
      { property: "og:description", content: "Una práctica que une yoga, astrología y acompañamiento." },
    ],
  }),
  component: SobreMi,
});

function SobreMi() {
  return (
    <>
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <p className="eyebrow text-gold">Sobre mí</p>
        <h1 className="mt-6 font-display text-5xl text-ink md:text-7xl">
          El gesto de acompañar.
        </h1>

        <div className="mt-12 space-y-6 text-base leading-relaxed text-ink/80 md:text-lg">
          <p className="font-display text-2xl italic text-ink md:text-3xl">
            Bienvenida. Este es un espacio íntimo, hecho a fuego lento.
          </p>
          <p>
            [Reemplaza este texto con tu historia.] Soy quien sostiene Venus
            Edición Limitada: una práctica nacida del cruce entre el yoga, la
            astrología y el deseo profundo de acompañar a otras personas en sus
            procesos de transformación.
          </p>
          <p>
            Mi camino comenzó… [continúa contando tu historia: formación, qué te
            llevó al yoga, cómo entró la astrología en tu vida, qué entiendes hoy
            por acompañamiento terapéutico].
          </p>
          <p>
            Hoy ofrezco sesiones individuales, lecturas de carta astral y
            recursos que puedas llevarte a casa. Cada propuesta nace de la
            escucha y se adapta a tu momento.
          </p>
        </div>

        <div className="mt-16 border-t border-border/40 pt-12">
          <p className="eyebrow text-gold">Formación</p>
          <ul className="mt-6 space-y-3 text-sm text-ink/75">
            <li>— [Formación 1 en yoga / linaje / horas]</li>
            <li>— [Formación 2 en astrología / escuela]</li>
            <li>— [Otras herramientas de acompañamiento]</li>
          </ul>
        </div>
      </article>
    </>
  );
}