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

  return (
    <ListLayout
      sectionClass="section-card-forest"
      // CAMBIA ESTO POR LAS CLASES DE TU ESTILO:
      sidebarClass="border border-forest-green" 
      items={data.currentItems}
      pagination={{ currentPage: data.currentPage, totalPages: data.totalPages, setCurrentPage: data.setCurrentPage }}
      renderFeature={(a) => (
        <FeatureCard 
          key={a.id} 
          item={a} 
          mPrincipal={0.7} 
          // AQUÍ CAMBIAS EL COLOR DE LA TARJETA PRINCIPAL:
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
          // AQUÍ CAMBIAS EL COLOR DE LAS TARJETAS PEQUEÑAS:
          themeClasses="border border-forest-green" 
          linkTo="/$seccion/$slug" 
          linkParams={{ seccion: "astrologia", slug: a.slug }} 
          tagLabel={a.tarjetas} 
        />
      )}
    />
  );
}