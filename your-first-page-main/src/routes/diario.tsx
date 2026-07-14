import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { ListLayout } from "@/components/layout/ListLayout"; // Asegúrate de que esta ruta sea correcta
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

  // Configuraciones de escala
  const mPrincipal = 0.7; 
  const mSecundaria = 0.6;

  return (
    <ListLayout
      // 1. CONFIGURACIÓN DE SECCIÓN: Cambia aquí la clase global de la sección
      sectionClass="section-diario"
      
      // 2. CAJA LATERAL: Cambia aquí los bordes/colores de la imagen fija de la derecha
      sidebarClass="border border-cream/30 bg-cream/5 hover:border-gold"
      
      items={currentPosts}
      pagination={{ currentPage, totalPages, setCurrentPage }}
      
      renderFeature={(p) => (
        <FeatureCard 
          key={p.id} 
          item={p} 
          mPrincipal={mPrincipal} 
          // 3. TARJETA PRINCIPAL: Cambia aquí los colores/bordes de la tarjeta grande
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
          // 4. TARJETAS SECUNDARIAS: Cambia aquí los colores/bordes de las tarjetas pequeñas
          themeClasses="border border-cream/20 bg-cream/5 hover:border-gold" 
          linkTo="/diario/$slug" 
          linkParams={{ slug: p.slug }} 
          tagLabel="Diario" 
        />
      )}
    />
  );
}