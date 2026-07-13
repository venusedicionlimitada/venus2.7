import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "../components/SiteHeader";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationPages,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/yoga")({
  head: () => ({
    meta: [
      { title: "Yoga · Venus Edición Limitada" },
      { name: "description", content: "Prácticas, filosofía y meditación para habitar el cuerpo." },
      { property: "og:title", content: "Yoga · Venus" },
      { property: "og:description", content: "Prácticas, filosofía y meditación para habitar el cuerpo." },
    ],
  }),
  component: Yoga,
});

type Article = {
  id: string; 
  slug: string;
  tarjetas: string; 
  date_label: string; 
  title: string; 
  description: string; 
  body: string | null; 
  cover_image_url: string | null;
};

function Yoga() {
  const location = useLocation();
const esLaLista = location.pathname === "/yoga" || location.pathname === "/yoga/";

if (!esLaLista) {
  return <Outlet />;
}
  
  const [items, setItems] = useState<Article[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 7;

  const escalaPrincipal = 70; 
  const escalaSecundaria = 60;

  const mPrincipal = escalaPrincipal / 100;
  const mSecundaria = escalaSecundaria / 100;

  useEffect(() => {
    supabase.from("yoga_articles")
      .select("id, slug, tarjetas, date_label, title, description, body, cover_image_url")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setItems((data ?? []) as Article[]));
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentItems = items ? items.slice(indexOfFirstPost, indexOfLastPost) : [];
  const totalPages = items ? Math.ceil(items.length / postsPerPage) : 0;

  return (
    <>
      <SiteHeader />

      <div className="section-yoga">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          
          {items === null ? (
            <p className="mt-20 text-center text-sm opacity-70">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="mt-20 text-center text-sm opacity-70">Pronto, nuevos análisis.</p>
          ) : (
            <div className="flex flex-col gap-24">
              
              <div className="flex flex-col md:flex-row items-start gap-8 w-full">

                {currentItems.slice(0, 1).map((a) => {
                  const hasImage = !!a.cover_image_url;
                  return (
                    <div key={a.id} className="flex flex-col">
                      <article 
                        className={`group border p-8 transition-colors w-full mx-auto overflow-hidden relative ${
                          hasImage ? "grid gap-8 md:grid-cols-2 md:gap-16 items-center" : "flex flex-col"
                        }`}
                        style={{
                          width: `${1180 * mPrincipal}px`,
                          height: `${400 * mPrincipal}px`,
                          maxWidth: "100%",
                          transform: "translate(-40px, 0px)"
                        }}
                      >
                        {hasImage && (
                          <img 
                            src={a.cover_image_url} 
                            alt="" 
                            className="w-full object-contain aspect-[4/3]" 
                            style={{
                              width: "100%",
                              height: "auto",
                              maxHeight: `${350 * mPrincipal}px`,
                              transform: "translate(-90px, -15px)"
                            }}
                          />
                        )}
                        <div className="flex flex-col h-full justify-high">
                          <h2 
                            className="mt-4 font-display text-4xl md:text-4xl transition-colors" 
                            style={{ 
                              transform: "translateX(-160px) translateY(-30px)",
                              width: "calc(80% + 160px)"
                            }}
                          >
                            {a.title}
                          </h2>
                          
                          <h2 
                            className="mt-4 font-sans leading-relaxed line-clamp-4" 
                            style={{ 
                              transform: "translateX(-160px) translateY(-40px)",
                              fontSize: "16px",
                              lineHeight: "1.4",
                              letterSpacing: "0.4px",
                              fontWeight: "400",
                              width: "calc(80% + 160px)"
                            }} 
                          >
                            {a.description}
                          </h2>
                          
                          {!hasImage && a.body && (
                            <div className="prose prose-sm max-w-none opacity-60 line-clamp-6 mt-6 pt-6 border-t border-current/10">
                              <div dangerouslySetInnerHTML={{ __html: a.body }} />
                            </div>
                          )}

                          <div 
                            style={{ 
                              position: "absolute", 
                              bottom: "32px", 
                              right: "32px", 
                              transform: "translate(0px, 10px)" 
                            }}
                          >
                            <Link 
                              to="/$seccion/$slug" 
                              params={{ seccion: "yoga", slug: a.slug }}
                              className="inline-block eyebrow border-b border-granate/40 pb-1 transition-colors"
                              style={{ letterSpacing: "1px" }}
                            >
                              Leer más
                            </Link>
                          </div>
                        </div>
                      </article>

                      <div 
                        className="flex items-center justify-between mt-3 px-1"
                        style={{ 
                          width: `${1165 * mPrincipal}px`, 
                          maxWidth: "100%",
                          transform: "translate(-30px, 0px)"
                        }}
                      >
                        <span className="eyebrow tag-label">{a.tarjetas}</span>
                        <span className="eyebrow date-label">{a.date_label}</span>
                      </div>
                    </div>
                  );
                })}

                <div 
                  className="hidden md:block group border p-6 transition-colors overflow-hidden"
                  style={{
                    width: "370px",
                    height: "280px",
                    transform: "translate(-10px, 0px)"
                  }}
                >
                  <img 
                    src="/src/assets/Venus_08.jpg" 
                    alt="Contenido Recomendado" 
                    className="w-full h-full object-cover"
                  />
                </div>

              </div>

              {currentItems.length > 1 && (
                <div className="grid gap-x-12 gap-y-0 md:grid-cols-3">
                  
                  {currentItems.slice(1).map((a, idx) => {
                    const hasImage = !!a.cover_image_url;
                    
                    return (
                      <div key={a.id} className={`flex flex-col mb-16 ${idx % 3 === 1 ? "md:mt-20" : ""}`}>
                        <article 
                          className="group flex flex-col border pt-5 px-8 pb-8 transition-colors overflow-hidden relative"
                          style={{
                            width: `${616 * mSecundaria}px`,
                            height: `${500 * mSecundaria}px`,
                            maxWidth: "100%",
                            transform: "translate(0px, 0px)"
                          }}
                        >
                          {hasImage && (
                            <img 
                              src={a.cover_image_url} 
                              alt="" 
                              className="mt-2 w-full object-cover" 
                              style={{
                                width: "100%",
                                height: "100%",
                                maxHeight: "170px",
                                transform: "translate(0px, 0px)"
                              }}
                            />
                          )}

                          {!hasImage && (
                            <h2 className="mt-3 font-display text-2xl md:text-3xl transition-colors">
                              {a.title}
                            </h2>
                          )}

                          {!hasImage && (
                            <p className="mt-4 text-sm leading-relaxed line-clamp-2">
                              {a.description}
                            </p>
                          )}

                          <div 
                            style={{ 
                              position: "absolute", 
                              bottom: "32px", 
                              right: "32px", 
                              transform: "translate(2px, 15px)" 
                            }}
                          >
                            <Link 
                              to="/$seccion/$slug" 
                              params={{ seccion: "yoga", slug: a.slug }} 
                              className="inline-block eyebrow border-b pb-1 transition-colors" 
                              style={{ fontSize: "11px" }}
                            >
                              Leer publicación
                            </Link>
                          </div>
                        </article>

                        <div 
                          className="flex items-center justify-between mt-3 px-1"
                          style={{ 
                            width: `${616 * mSecundaria}px`, 
                            maxWidth: "100%" 
                          }}
                        >
                          <span className="eyebrow tag-secondary-label">{a.tarjetas}</span>
                          <span className="eyebrow date-secondary-label">{a.date_label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <Pagination className="mt-12 cursor-pointer">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      />
                    </PaginationItem>
                    
                    <PaginationPages 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      setCurrentPage={setCurrentPage}
                    />

                    <PaginationItem>
                      <PaginationNext 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  );
}