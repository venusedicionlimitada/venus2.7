import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "../components/SiteHeader";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationPages,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos Lunares · Venus Edición Limitada" },
      { name: "description", content: "Círculos, rituales y encuentros bajo el ritmo de la Luna." },
      { property: "og:title", content: "Eventos · Venus" },
      { property: "og:description", content: "Encuentros y rituales lunares." },
    ],
  }),
  component: Eventos,
});

type LunarEvent = {
  id: string;
  titulo: string;
  subtitulo: string;
  description: string;
  cover_image_url: string | null;
  fecha_evento: string;
  hora_evento: string;
};

function Eventos() {
  const [items, setItems] = useState<LunarEvent[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 7;

  useEffect(() => {
    supabase.from("lunar_events")
      .select("id, titulo, subtitulo, description, cover_image_url, fecha_evento, hora_evento")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setItems((data ?? []) as LunarEvent[]));
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentItems = items ? items.slice(indexOfFirstPost, indexOfLastPost) : [];
  const totalPages = items ? Math.ceil(items.length / postsPerPage) : 0;

  return (
    <>
      <SiteHeader />

      <div className="section-forest">
        <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
          <header className="text-center">
            <p className="eyebrow text-gold">Encuentros</p>
            <h1 className="mt-6 font-display text-5xl text-cream md:text-7xl">
              Sintonizar con el ritmo cíclico.
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-cream/85">
              Espacios compartidos, círculos y rituales programados según las configuraciones del cielo para encarnar la energía del tránsito.
            </p>
          </header>

          {items === null ? (
            <p className="mt-20 text-center text-sm text-cream/70">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="mt-20 text-center text-sm text-cream/70">No hay eventos programados en este momento. Pronto habrá nuevas fechas.</p>
          ) : (
            <>
              <div className="mt-20 grid gap-6 md:grid-cols-2">
                {currentItems.map((e) => (
                  <article key={e.id} className="group flex flex-col border border-cream/20 bg-cream/5 p-8 transition-colors hover:border-gold">
                    {e.cover_image_url && <img src={e.cover_image_url} alt="" className="mb-6 max-h-60 w-full object-cover" />}
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-gold">{e.subtitulo}</span>
                      <span className="eyebrow text-cream/60">{e.fecha_evento} · {e.hora_evento}</span>
                    </div>
                    <h2 className="mt-6 font-display text-2xl text-cream md:text-3xl">{e.titulo}</h2>
                    <p className="mt-4 text-sm leading-relaxed text-cream/85 whitespace-pre-wrap">{e.description}</p>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-12 cursor-pointer">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      />
                    </PaginationItem>
                    
                    <PaginationPages 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      setCurrentPage={setCurrentPage}
                    />

                    <PaginationItem>
                      <PaginationNext 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}