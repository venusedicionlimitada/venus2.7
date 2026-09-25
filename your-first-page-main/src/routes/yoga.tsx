import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ListLayout } from "@/components/layout/ListLayout";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { GridCard } from "@/components/cards/GridCard";
import { useContentData } from "@/lib/hooks/useContentData";
import { useSectionActive } from "@/lib/hooks/useSectionActive";
import { SectionPaused } from "@/components/SectionPaused";

type YogaArticle = {
  id: string; 
  slug: string;
  tarjetas: string; 
  date_label: string; 
  title: string; 
  description: string; 
  body: string | null; 
  cover_image_url: string | null;
};

export const Route = createFileRoute("/yoga")({
  component: Yoga,
});

function Yoga() {
  const location = useLocation();
  const sectionActive = useSectionActive("yoga");
  const { items, featuredItem, secondaryItems, currentPage, totalPages, setCurrentPage, error } = useContentData<YogaArticle>("yoga_articles", 7);

  if (location.pathname !== "/yoga" && location.pathname !== "/yoga/") return <Outlet />;
  if (sectionActive === false) return <SectionPaused className="section-yoga" />;

  // Configuraciones de escala
  const mPrincipal = 0.7; 
  const mSecundaria = 0.6;

  const currentFeaturedItem = currentPage > 1 ? null : featuredItem;

  return (
    <ListLayout
      sectionClass="section-yoga"
      sidebarClass="border"
      items={items}
      featuredItem={currentFeaturedItem}
      secondaryItems={secondaryItems}
      error={error}
      pagination={{ currentPage, totalPages, setCurrentPage }}
      renderFeature={(a) => (
        <FeatureCard 
          key={a.id} 
          item={a} 
          mPrincipal={mPrincipal} 
          themeClasses="border" 
          linkTo="/$seccion/$slug" 
          linkParams={{ seccion: "yoga", slug: a.slug }} 
          tagLabel={a.tarjetas} 
        />
      )}
      renderSecondary={(a, idx) => (
        <GridCard 
          key={a.id} 
          item={a} 
          mSecundaria={mSecundaria} 
          idx={idx} 
          themeClasses="border" 
          linkTo="/$seccion/$slug" 
          linkParams={{ seccion: "yoga", slug: a.slug }} 
          tagLabel={a.tarjetas} 
        />
      )}
    />
  );
}