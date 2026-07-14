import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "../components/SiteHeader";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationPages } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CategoryDetailSheet } from "@/components/events/CategoryDetailSheet"; // Nuevo componente

export const Route = createFileRoute("/eventos")({
  component: Eventos,
});

function Eventos() {
  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    supabase.from("lunar_events")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setItems((data ?? [])));
  }, []);

  // Lógica de Agrupación: transformamos eventos en categorías únicas
  const categories = useMemo(() => {
    const map = new Map();
    items.forEach(event => {
      if (!event.categoria_emocional) return;
      const cats = event.categoria_emocional.split(',').map((c: string) => c.trim());
      cats.forEach((cat: string) => {
        if (!map.has(cat)) {
          map.set(cat, {
            nombre: cat,
            representative: event // Usamos el primer evento encontrado para la foto y descripción
          });
        }
      });
    });
    return Array.from(map.values());
  }, [items]);

  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentCategories = categories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(categories.length / postsPerPage);

  return (
    <>
      <SiteHeader />
      <div className="section-forest">
        <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <header className="text-center">
            <p className="eyebrow text-gold">Astrología Emocional</p>
            <h1 className="mt-6 font-display text-5xl text-cream md:text-7xl">
              Sintonizar con el ritmo cíclico.
            </h1>
          </header>

          <div className="mt-20 grid gap-6 md:grid-cols-3">
  {currentCategories.map((cat) => (
    <Sheet key={cat.nombre}>
      <SheetTrigger asChild>
        {/* Modifica los valores entre corchetes para ancho, alto y coordenadas */}
        <div className="relative w-[100%] h-[100%] top-[0px] left-[0px]">
          <article className="w-full h-full cursor-pointer group flex flex-col border border-cream/20 bg-cream/5 p-8 transition-colors hover:border-gold">
            {cat.representative.cover_image_url && (
              <img src={cat.representative.cover_image_url} alt="" className="mb-6 max-h-60 w-full object-cover" />
            )}
            <span className="eyebrow text-gold">Categoría Emocional</span>
            <h2 className="mt-6 font-display text-3xl text-cream">{cat.nombre}</h2>
            <p className="mt-4 text-sm text-cream/85">Explorar herramientas y conexiones para esta sintonía.</p>
          </article>
        </div>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-xl bg-background border-l border-gold/70 p-0 overflow-y-auto">
        <CategoryDetailSheet categoria={cat.nombre} />
      </SheetContent>
    </Sheet>
  ))}
</div>
        </div>
      </div>
    </>
  );
}