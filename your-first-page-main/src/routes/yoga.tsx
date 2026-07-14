import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ListLayout } from "@/components/layout/ListLayout";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { GridCard } from "@/components/cards/GridCard";
import { useContentData } from "@/lib/hooks/useContentData";

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
  const { currentItems, currentPage, totalPages, setCurrentPage } = useContentData<YogaArticle>("yoga_articles", 7);

  if (location.pathname !== "/yoga" && location.pathname !== "/yoga/") return <Outlet />;

  // Configuraciones de escala
  const mPrincipal = 0.7; 
  const mSecundaria = 0.6;

  return (
    <ListLayout
      // 1. CONFIGURACIÓN DE SECCIÓN: Clase del contenedor global
      sectionClass="section-yoga"
      
      // 2. CAJA LATERAL: Clase para el borde de la imagen fija de la derecha
      sidebarClass="border"
      
      items={currentItems}
      pagination={{ currentPage, totalPages, setCurrentPage }}
      
      renderFeature={(a) => (
        <FeatureCard 
          key={a.id} 
          item={a} 
          mPrincipal={mPrincipal} 
          // 3. TARJETA PRINCIPAL: Tus colores/bordes aquí
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
          // 4. TARJETAS SECUNDARIAS: Tus colores/bordes aquí
          themeClasses="border" 
          linkTo="/$seccion/$slug" 
          linkParams={{ seccion: "yoga", slug: a.slug }} 
          tagLabel={a.tarjetas} 
        />
      )}
    />
  );
}