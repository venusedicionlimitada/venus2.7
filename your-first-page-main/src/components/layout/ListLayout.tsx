import { SiteHeader } from "@/components/SiteHeader";
import { PaginationControl } from "@/components/ui/pagination-control";
import { SideRecommendImage } from "@/components/SideRecommendImage";

type ListLayoutProps = {
  sectionClass: string;
  sidebarClass?: string;
  items: any[] | null;
  featuredItem: any | null;
  secondaryItems: any[];
  error?: string | null;
  renderFeature: (item: any) => React.ReactNode;
  renderSecondary: (item: any, idx: number) => React.ReactNode;
  pagination: { currentPage: number; totalPages: number; setCurrentPage: (p: number) => void };
};

export function ListLayout({
  sectionClass,
  items,
  featuredItem,
  secondaryItems,
  error,
  renderFeature,
  renderSecondary,
  pagination,
}: ListLayoutProps) {
  const showFeatured = pagination.currentPage === 1 && featuredItem;

  return (
    <>
      <SiteHeader />
      <div className={sectionClass}>
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          {!items ? (
            <p className="mt-20 text-center text-sm opacity-70">Cargando…</p>
          ) : error ? (
            <p className="mt-20 text-center text-sm text-wine/80">
              No se pudieron cargar las publicaciones. Revisa la consola del navegador o la conexión con Supabase.
            </p>
          ) : items.length === 0 ? (
            <p className="mt-20 text-center text-sm opacity-70">
              No hay publicaciones publicadas todavía. Créalas y actívalas en el panel de administración.
            </p>
          ) : (
            <div className="flex flex-col gap-24">
              {showFeatured && (
                <div className="flex flex-col md:flex-row items-start gap-8 w-full">
                  <div className="w-full flex-1 min-w-0">
                    {renderFeature(featuredItem)}
                  </div>
                  <SideRecommendImage src={featuredItem.cover_image_url} />
                </div>
              )}
              {secondaryItems.length > 0 && (
                <div className="grid gap-x-6 md:gap-x-12 gap-y-6 md:gap-y-0 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {secondaryItems.map(renderSecondary)}
                </div>
              )}

              <PaginationControl {...pagination} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
