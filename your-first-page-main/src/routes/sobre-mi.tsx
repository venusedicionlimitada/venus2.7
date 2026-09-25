import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useSectionActive } from "@/lib/hooks/useSectionActive";
import { SectionPaused } from "@/components/SectionPaused";

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

type SobreMiRow = {
  title: string;
  lead: string | null;
  body: string | null;
  formacion: string | null;
};

const FALLBACK: SobreMiRow = {
  title: "El gesto de acompañar.",
  lead: "Bienvenida. Este es un espacio íntimo, hecho a fuego lento.",
  body: "<p>[Reemplaza este texto con tu historia.] Soy quien sostiene Venus Edición Limitada: una práctica nacida del cruce entre el yoga, la astrología y el deseo profundo de acompañar a otras personas en sus procesos de transformación.</p><p>Mi camino comenzó… [continúa contando tu historia: formación, qué te llevó al yoga, cómo entró la astrología en tu vida, qué entiendes hoy por acompañamiento terapéutico].</p><p>Hoy ofrezco sesiones individuales, lecturas de carta astral y recursos que puedas llevarte a casa. Cada propuesta nace de la escucha y se adapta a tu momento.</p>",
  formacion: "[Formación 1 en yoga / linaje / horas]\n[Formación 2 en astrología / escuela]\n[Otras herramientas de acompañamiento]",
};

function formacionItems(value: string | null) {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^—\s*/, ""));
}

function SobreMi() {
  const sectionActive = useSectionActive("sobre-mi");
  const [page, setPage] = useState<SobreMiRow | null>(null);

  useEffect(() => {
    supabase
      .from("sobre_mi")
      .select("title, lead, body, formacion")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPage((data as SobreMiRow | null) ?? FALLBACK))
      .catch(() => setPage(FALLBACK));
  }, []);

  if (sectionActive === false) return <SectionPaused />;

  if (!page) {
    return (
      <>
        <SiteHeader />
        <p className="mx-auto max-w-3xl px-6 py-24 text-sm text-ink/60">Cargando…</p>
      </>
    );
  }

  const content = page;
  const items = formacionItems(content.formacion);

  return (
    <>
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <p className="eyebrow text-gold">Sobre mí</p>
        <h1 className="mt-6 font-display text-5xl text-ink md:text-7xl">
          {content.title}
        </h1>

        <div className="mt-12 space-y-6 text-base leading-relaxed text-ink/80 md:text-lg">
          {content.lead && (
            <p className="font-display text-2xl italic text-ink md:text-3xl">
              {content.lead}
            </p>
          )}
          {content.body && (
            <div
              className="space-y-6 [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-16 border-t border-border/40 pt-12">
            <p className="eyebrow text-gold">Formación</p>
            <ul className="mt-6 space-y-3 text-sm text-ink/75">
              {items.map((item) => (
                <li key={item}>— {item}</li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </>
  );
}
