import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "../components/SiteHeader";
import { PaginationControl } from "@/components/ui/pagination-control";
import { EmotionalCategoryCard, tarjetasDeEmocion, type EmotionFicha } from "@/components/events/EmotionalCategoryCard";
import { useSectionActive } from "@/lib/hooks/useSectionActive";
import { SectionPaused } from "@/components/SectionPaused";

export const Route = createFileRoute("/eventos")({
  component: Eventos,
});

function Eventos() {
  const sectionActive = useSectionActive("eventos");
  const [items, setItems] = useState<any[]>([]);
  const [fichas, setFichas] = useState<EmotionFicha[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    supabase.from("lunar_events")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setItems((data ?? [])));
    supabase.from("emociones")
      .select("nombre, subtitulo, extracto, descripcion, cover_image_url")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setFichas((data ?? []) as EmotionFicha[]));
  }, []);

  const categories = useMemo(
    () => tarjetasDeEmocion(items, fichas),
    [items, fichas],
  );

  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentCategories = categories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(categories.length / postsPerPage);

  if (sectionActive === false) return <SectionPaused className="bg-verdejoya text-cream" />;

  return (
    <>
      <SiteHeader />
      <div className="bg-verdejoya text-cream">
        <div className="mx-auto max-w-5xl px-6 pt-8 md:pt-12">
          <header className="mx-auto max-w-4xl text-center">
            <h1 className="eyebrow text-base tracking-[0.16em] text-gold sm:text-lg md:text-xl md:tracking-[0.2em]">
              Astrología Emocional Aplicada
            </h1>
            <p className="mt-6 text-base leading-relaxed text-cream/85 md:text-lg">
              Elige la emoción que quieres trabajar. Cada una reúne las prácticas que acompañan esa energía: el cuerpo, la reflexión y el acompañamiento, según lo que haya disponible.
            </p>
          </header>
        </div>

        <div className="mx-auto max-w-[66rem] px-6 pb-24 pt-20 md:pb-32">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            {currentCategories.map((cat) => (
              <EmotionalCategoryCard key={cat.nombre} cat={cat} />
            ))}
          </div>

          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
}