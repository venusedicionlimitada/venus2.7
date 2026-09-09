import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ListLayout } from "@/components/layout/ListLayout";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { GridCard } from "@/components/cards/GridCard";
import { useContentData } from "@/lib/hooks/useContentData";

export const Route = createFileRoute("/astrologia")({ component: Astrologia });

function Astrologia() {
  const location = useLocation();
  const data = useContentData<any>("astrology_articles", 7);
  
  if (location.pathname !== "/astrologia" && location.pathname !== "/astrologia/") return <Outlet />;

  const currentFeaturedItem = data.currentPage > 1 ? null : data.featuredItem;

  return (
    <ListLayout
      sectionClass="section-card-forest"
      sidebarClass="border border-forest-green" 
      items={data.items}
      featuredItem={currentFeaturedItem}
      secondaryItems={data.secondaryItems}
      error={data.error}
      pagination={{ currentPage: data.currentPage, totalPages: data.totalPages, setCurrentPage: data.setCurrentPage }}
      renderFeature={(a) => (
        <FeatureCard 
          key={a.id} 
          item={a} 
          mPrincipal={0.7} 
          themeClasses="border border-forest-green" 
          linkTo="/$seccion/$slug" 
          linkParams={{ seccion: "astrologia", slug: a.slug }} 
          tagLabel={a.tarjetas} 
        />
      )}
      renderSecondary={(a, idx) => (
        <GridCard 
          key={a.id} 
          item={a} 
          mSecundaria={0.6} 
          idx={idx} 
          themeClasses="border border-forest-green" 
          linkTo="/$seccion/$slug" 
          linkParams={{ seccion: "astrologia", slug: a.slug }} 
          tagLabel={a.tarjetas} 
        />
      )}
    />
  );
}