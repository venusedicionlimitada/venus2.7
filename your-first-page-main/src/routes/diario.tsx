import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "../components/SiteHeader";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationPages,
} from "@/components/ui/pagination";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { GridCard } from "@/components/cards/GridCard";

export const Route = createFileRoute("/diario")({
  head: () => ({
    meta: [
      { title: "Diario · Venus Edición Limitada" },
      { name: "description", content: "Reflexiones íntimas sobre el cuerpo, la práctica y los procesos de transformación." },
      { property: "og:title", content: "Diario · Venus" },
      { property: "og:description", content: "Reflexiones sobre cuerpo, práctica y procesos." },
    ],
  }),
  component: Diario,
});

type Post = {
  id: string; 
  slug: string;
  date_label: string; 
  title: string; 
  description: string; 
  body: string | null; 
  cover_image_url: string | null;
};

function Diario() {
const location = useLocation();
const esLaLista = location.pathname === "/diario" || location.pathname === "/diario/";

if (!esLaLista) {
  return <Outlet />;
}

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 7;

  // >>> MODIFICA ESTOS PORCENTAJES DE FORMA INDEPENDIENTE (100 = 100%) <<<
  const escalaPrincipal = 70; 
  const escalaSecundaria = 60;

  const mPrincipal = escalaPrincipal / 100;
  const mSecundaria = escalaSecundaria / 100;

  useEffect(() => {
    supabase.from("diary_entries")
      .select("id, slug, date_label, title, description, body, cover_image_url")
      .eq("published", true).order("sort_order")
      .then(({ data }) => setPosts((data ?? []) as Post[]));
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts ? posts.slice(indexOfFirstPost, indexOfLastPost) : [];
  const totalPages = posts ? Math.ceil(posts.length / postsPerPage) : 0;

  return (
    <>
      <SiteHeader />

      <div className="section-diario">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          
          {posts === null ? (
            <p className="mt-20 text-center text-sm opacity-70">Cargando…</p>
          ) : posts.length === 0 ? (
            <p className="mt-20 text-center text-sm opacity-70">Pronto, nuevos análisis.</p>
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