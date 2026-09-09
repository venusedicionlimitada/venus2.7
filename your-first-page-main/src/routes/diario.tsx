import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ListLayout } from "@/components/layout/ListLayout";
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
  const { items, featuredItem, secondaryItems, currentPage, totalPages, setCurrentPage, error } = useContentData<Post>("diary_entries", 7);

  if (location.pathname !== "/diario" && location.pathname !== "/diario/") return <Outlet />;

  // Configuraciones de escala
  const mPrincipal = 0.7; 
  const mSecundaria = 0.6;

  // Si estamos en la página 2 o superior, ocultamos el elemento principal
  const currentFeaturedItem = currentPage > 1 ? null : featuredItem;

  return (
    <ListLayout
      sectionClass="section-diario"
      sidebarClass="border border-cream/30 bg-cream/5 hover:border-gold"
      items={items}
      featuredItem={currentFeaturedItem}
      secondaryItems={secondaryItems}
      error={error}
      pagination={{ currentPage, totalPages, setCurrentPage }}
      renderFeature={(p) => (
        <FeatureCard 
          key={p.id} 
          item={p} 
          mPrincipal={mPrincipal} 
          themeClasses="border border-cream/30 bg-cream/5 hover:border-gold" 
          linkTo="/diario/$slug" 
          linkParams={{ slug: p.slug }} 
          tagLabel="Diario" 
        />
      )}
      renderSecondary={(p, idx) => (
        <GridCard 
          key={p.id} 
          item={p} 
          mSecundaria={mSecundaria} 
          idx={idx} 
          themeClasses="border border-cream/20 bg-cream/5 hover:border-gold" 
          linkTo="/diario/$slug" 
          linkParams={{ slug: p.slug }} 
          tagLabel="Diario" 
        />
      )}
    />
  );
}