import { SiteHeader } from "@/components/SiteHeader";
import { PaginationControl } from "@/components/ui/pagination-control";

type ListLayoutProps = {
  sectionClass: string;
  items: any[] | null;
  renderFeature: (item: any) => React.ReactNode;
  renderSecondary: (item: any, idx: number) => React.ReactNode;
  pagination: { currentPage: number; totalPages: number; setCurrentPage: (p: number) => void };
};

export function ListLayout({ sectionClass, items, renderFeature, renderSecondary, pagination }: ListLayoutProps) {
  return (
    <>
      <SiteHeader />
      <div className={sectionClass}>
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          {!items ? (
            <p className="mt-20 text-center text-sm opacity-70">Cargando…</p>
          ) : (
            <div className="flex flex-col gap-24">
              <div className="flex flex-col md:flex-row items-start gap-8 w-full">
                {items.slice(0, 1).map(renderFeature)}
                <div className="hidden md:block group border p-6 transition-colors overflow-hidden" style={{ width: "370px", height: "280px", transform: "translate(-10px, 0px)" }}>
                  <img src="/src/assets/Venus_08.jpg" alt="Contenido Recomendado" className="w-full h-full object-cover" />
                </div>
              </div>

              {items.length > 1 && (
                <div className="grid gap-x-12 gap-y-0 md:grid-cols-3">
                  {items.slice(1).map(renderSecondary)}
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