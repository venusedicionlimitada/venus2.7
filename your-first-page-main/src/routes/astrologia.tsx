import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader";
import { PaginationControl } from "@/components/ui/pagination-control";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { GridCard } from "@/components/cards/GridCard";
import { useContentData } from "@/lib/hooks/useContentData";

type AstroArticle = {
  id: string; 
  slug: string;
  tarjetas: string; 
  date_label: string; 
  title: string; 
  description: string; 
  body: string | null; 
  cover_image_url: string | null;
};

export const Route = createFileRoute("/astrologia")({
  component: Astrologia,
});

function Astrologia() {
  const location = useLocation();
  const { currentItems, currentPage, totalPages, setCurrentPage } = useContentData<AstroArticle>("astrology_articles", 7);

  if (location.pathname !== "/astrologia" && location.pathname !== "/astrologia/") return <Outlet />;

  const mPrincipal = 0.7; 
  const mSecundaria = 0.6;

  return (
    <>
      <SiteHeader />
      <div className="section-card-forest">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          {!currentItems ? (
            <p className="mt-20 text-center text-sm opacity-70">Cargando…</p>
          ) : (
            <div className="flex flex-col gap-24">
              
              <div className="flex flex-col md:flex-row items-start gap-8 w-full">
                {currentItems.slice(0, 1).map((a) => (
                  <FeatureCard 
                    key={a.id} 
                    item={a} 
                    mPrincipal={mPrincipal} 
                    themeClasses="border" 
                    linkTo="/$seccion/$slug" 
                    linkParams={{ seccion: "astrologia", slug: a.slug }} 
                    tagLabel={a.tarjetas} 
                  />
                ))}
                <div className="hidden md:block group border p-6 transition-colors overflow-hidden" style={{ width: "370px", height: "280px", transform: "translate(-10px, 0px)" }}>
                  <img src="/src/assets/Venus_08.jpg" alt="Contenido Recomendado" className="w-full h-full object-cover" />
                </div>
              </div>

              {currentItems.length > 1 && (
                <div className="grid gap-x-12 gap-y-0 md:grid-cols-3">
                  {currentItems.slice(1).map((a, idx) => (
                    <GridCard 
                      key={a.id} 
                      item={a} 
                      mSecundaria={mSecundaria} 
                      idx={idx} 
                      themeClasses="border" 
                      linkTo="/$seccion/$slug" 
                      linkParams={{ seccion: "astrologia", slug: a.slug }} 
                      tagLabel={a.tarjetas} 
                    />
                  ))}
                </div>
              )}

              <PaginationControl 
                currentPage={currentPage} 
                totalPages={totalPages} 
                setCurrentPage={setCurrentPage} 
              />
              
            </div>
          )}
        </div>
      </div>
    </>
  );
}