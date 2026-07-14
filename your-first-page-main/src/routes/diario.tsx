import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader";
import { PaginationControl } from "@/components/ui/pagination-control";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { GridCard } from "@/components/cards/GridCard";
import { useContentData } from "@/lib/hooks/useContentData";

type Post = {
  id: string; 
  slug: string;
  date_label: string; 
  title: string; 
  description: string; 
  body: string | null; 
  cover_image_url: string | null;
  tarjetas: string;
};

export const Route = createFileRoute("/diario")({
  component: Diario,
});

function Diario() {
  const location = useLocation();
  const { currentItems: currentPosts, currentPage, totalPages, setCurrentPage } = useContentData<Post>("diary_entries", 7);

  if (location.pathname !== "/diario" && location.pathname !== "/diario/") return <Outlet />;

  const mPrincipal = 0.7; 
  const mSecundaria = 0.6;

  return (
    <>
      <SiteHeader />
      <div className="section-diario">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          {!currentPosts ? (
            <p className="mt-20 text-center text-sm opacity-70">Cargando…</p>
          ) : (
            <div className="flex flex-col gap-24">
              <div className="flex flex-col md:flex-row items-start gap-8 w-full">
                {currentPosts.slice(0, 1).map((p) => (
                  <FeatureCard key={p.id} item={p} mPrincipal={mPrincipal} themeClasses="border border-cream/30 bg-cream/5 hover:border-gold" linkTo="/diario/$slug" linkParams={{ slug: p.slug }} tagLabel="Diario" />
                ))}
                <div className="hidden md:block group border border-cream/30 bg-cream/5 p-6 transition-colors hover:border-gold overflow-hidden" style={{ width: "370px", height: "280px", transform: "translate(-10px, 0px)" }}>
                  <img src="/src/assets/Venus_08.jpg" alt="Contenido Recomendado" className="w-full h-full object-cover" />
                </div>
              </div>

              {currentPosts.length > 1 && (
                <div className="grid gap-x-12 gap-y-0 md:grid-cols-3">
                  {currentPosts.slice(1).map((p, idx) => (
                    <GridCard key={p.id} item={p} mSecundaria={mSecundaria} idx={idx} themeClasses="border border-cream/20 bg-cream/5 hover:border-gold" linkTo="/diario/$slug" linkParams={{ slug: p.slug }} tagLabel="Diario" />
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