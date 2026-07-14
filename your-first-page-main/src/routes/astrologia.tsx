import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
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
import { FeatureCard } from "@/components/cards/FeatureCard";
import { GridCard } from "@/components/cards/GridCard";

export const Route = createFileRoute("/astrologia")({
  head: () => ({
    meta: [
      { title: "Astrología · Venus Edición Limitada" },
      { name: "description", content: "Astrología emocional y tránsitos para el discernimiento psychological." },
      { property: "og:title", content: "Astrología · Venus" },
      { property: "og:description", content: "Astrología emocional y tránsitos para el discernimiento psychological." },
    ],
  }),
  component: Astrologia,
});

type Article = {
  id: string; 
  slug: string;
  tarjetas: string; 
  date_label: string; 
  title: string; 
  description: string; 
  body: string | null; 
  cover_image_url: string | null;
};

function Astrologia() {
  const location = useLocation();
  const esLaLista = location.pathname === "/astrologia" || location.pathname === "/astrologia/";

  if (!esLaLista) {
    return <Outlet />;
  }

  const [items, setItems] = useState<Article[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 7;

  const escalaPrincipal = 70; 
  const escalaSecundaria = 60;

  const mPrincipal = escalaPrincipal / 100;
  const mSecundaria = escalaSecundaria / 100;

  useEffect(() => {
    supabase.from("astrology_articles")
      .select("id, slug, tarjetas, date_label, title, description, body, cover_image_url")
      .eq("published", true).order("sort_order")
      .then(({ data }) => setItems((data ?? []) as Article[]));
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentItems = items ? items.slice(indexOfFirstPost, indexOfLastPost) : [];
  const totalPages = items ? Math.ceil(items.length / postsPerPage) : 0;

  return (
    <>
      <SiteHeader />

      <div className="section-card-forest">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          
          {items === null ? (
            <p className="mt-20 text-center text-sm opacity-70">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="mt-20 text-center text-sm opacity-70">Pronto, nuevos análisis.</p>
          ) : (
            <div className="flex flex-col gap-24">
              
              <div className="flex flex-col md:flex-row items-start gap-8 w-full">
  {currentItems.slice(0, 1).map((a) => (
    <FeatureCard key={a.id} item={a} mPrincipal={mPrincipal} themeClasses="border" linkTo="/$seccion/$slug" linkParams={{ seccion: "astrologia", slug: a.slug }} tagLabel={a.tarjetas} />
  ))}
  <div className="hidden md:block group border p-6 transition-colors overflow-hidden" style={{ width: "370px", height: "280px", transform: "translate(-10px, 0px)" }}>
    <img src="/src/assets/Venus_08.jpg" alt="Contenido Recomendado" className="w-full h-full object-cover" />
  </div>
</div>

{currentItems.length > 1 && (
  <div className="grid gap-x-12 gap-y-0 md:grid-cols-3">
    {currentItems.slice(1).map((a, idx) => (
      <GridCard key={a.id} item={a} mSecundaria={mSecundaria} idx={idx} themeClasses="border" linkTo="/$seccion/$slug" linkParams={{ seccion: "astrologia", slug: a.slug }} tagLabel={a.tarjetas} />
    ))}
  </div>
)}

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

            </div>
          )}
        </div>
      </div>
    </>
  );
}