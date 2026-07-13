import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "../components/SiteHeader";

type Article = {
  id: string; slug: string; tag: string; date_label: string; title: string;
  description: string; body: string | null; cover_image_url: string | null;
};

async function fetchArticle(slug: string): Promise<{ article: Article; related: Article[] }> {
  const { data, error } = await supabase
    .from("astrology_articles")
    .select("id, slug, tag, date_label, title, description, body, cover_image_url")
    .eq("slug", slug).eq("published", true).maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();

  const { data: rel } = await supabase
    .from("astrology_articles")
    .select("id, slug, tag, date_label, title, description, body, cover_image_url")
    .eq("published", true).neq("slug", slug).order("sort_order").limit(2);
  return { article: data as Article, related: (rel ?? []) as Article[] };
}

export const Route = createFileRoute("/astrologia/$slug")({
  loader: ({ params }) => fetchArticle(params.slug),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Artículo no encontrado" }, { name: "robots", content: "noindex" }] };
    const { article } = loaderData;
    return {
      meta: [
        { title: `${article.title} · Astrología` },
        { name: "description", content: article.description },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/astrologia/${params.slug}` },
        ...(article.cover_image_url ? [{ property: "og:image", content: article.cover_image_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/astrologia/${params.slug}` }],
    };
  },
  component: AstroDetail,
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <div className="section-forest">
        <div className="mx-auto max-w-2xl px-6 py-32 text-center">
          <h1 className="font-display text-3xl text-cream">No hemos podido cargar el artículo</h1>
          <button onClick={() => { router.invalidate(); reset(); }} className="mt-8 border border-gold px-6 py-3 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors">Reintentar</button>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="section-forest">
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <p className="eyebrow text-gold">404</p>
        <h1 className="mt-4 font-display text-4xl text-cream">Este artículo no existe</h1>
        <Link to="/astrologia" className="mt-8 inline-block border border-gold px-6 py-3 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors">Volver a Astrología</Link>
      </div>
    </div>
  ),
});

function AstroDetail() {
  const { article, related } = Route.useLoaderData();

  return (
    <>
      <SiteHeader />
      <div className="section-forest">
        <article className="mx-auto max-w-3xl px-6 py-20 md:py-28">
          <Link to="/astrologia" className="eyebrow text-gold hover:text-cream">← Astrología</Link>

          <header className="mt-8">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-gold">{article.tag}</span>
              <span className="eyebrow text-cream/60">{article.date_label}</span>
            </div>
            <h1 className="mt-6 font-display text-4xl leading-tight text-cream md:text-6xl">{article.title}</h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/85">{article.description}</p>
          </header>

          {article.cover_image_url && (
            <img src={article.cover_image_url} alt="" className="mt-12 w-full object-cover" />
          )}

          {article.body && (
            <div
              className="prose prose-lg prose-invert mt-12 max-w-none text-cream/85 prose-headings:font-display prose-headings:text-cream prose-a:text-gold prose-strong:text-cream"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          )}

          <hr className="mt-20 border-cream/20" />

          <div className="mt-12">
            <Link to="/astrologia" className="eyebrow text-gold hover:text-cream">← Volver a Astrología</Link>
          </div>

          {related.length > 0 && (
            <section className="mt-20">
              <p className="eyebrow text-gold">Sigue leyendo</p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {related.map((r: Article) => (
                  <Link key={r.id} to="/astrologia/$slug" params={{ slug: r.slug }} className="group block border border-cream/20 bg-cream/5 p-6 transition-colors hover:border-gold">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-gold">{r.tag}</span>
                      <span className="eyebrow text-cream/60">{r.date_label}</span>
                    </div>
                    <h3 className="mt-3 font-display text-xl text-cream group-hover:text-gold">{r.title}</h3>
                    <p className="mt-2 text-sm text-cream/70 line-clamp-3">{r.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  );
}
