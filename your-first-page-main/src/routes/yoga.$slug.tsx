import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "../components/SiteHeader";

type YogaArticles = {
  id: string; 
  slug: string; 
  tarjetas: string; 
  date_label: string; 
  title: string;
  description: string; 
  body: string | null; 
  cover_image_url: string | null;
};

async function fetchArticles(slug: string): Promise<{ articles: YogaArticles; related: YogaArticles[] }> {
  const { data, error } = await supabase
    .from("yoga_articles")
    .select("id, slug, tarjetas, date_label, title, description, body, cover_image_url")
    .eq("slug", slug).eq("published", true).maybeSingle();
    
  if (error) throw error;
  if (!data) throw notFound();

  const { data: rel } = await supabase
    .from("yoga_articles")
    .select("id, slug, tarjetas, date_label, title, description, body, cover_image_url")
    .eq("published", true).neq("slug", slug).order("sort_order").limit(2);
    
  return { articles: data as YogaArticles, related: (rel ?? []) as YogaArticles[] };
}

export const Route = createFileRoute("/yoga/$slug")({
  loader: ({ params }) => fetchArticles(params.slug),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Práctica no encontrada" }, { name: "robots", content: "noindex" }] };
    const { articles } = loaderData;
    return {
      meta: [
        { title: `${articles.title} · Yoga` },
        { name: "description", content: articles.description },
        { property: "og:title", content: articles.title },
        { property: "og:description", content: articles.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/yoga/${params.slug}` },
        ...(articles.cover_image_url ? [{ property: "og:image", content: articles.cover_image_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/yoga/${params.slug}` }],
    };
  },
  component: YogaDetail,
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl text-ink">No hemos podido cargar la práctica</h1>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-8 border border-gold px-6 py-3 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors">Reintentar</button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="eyebrow text-gold">404</p>
      <h1 className="mt-4 font-display text-4xl text-ink">Esta práctica no existe</h1>
      <Link to="/yoga" className="mt-8 inline-block border border-wine px-6 py-3 text-xs uppercase tracking-[0.3em] text-wine hover:bg-wine hover:text-cream transition-colors">Volver a Yoga</Link>
    </div>
  ),
});

function YogaDetail() {
  const { articles, related } = Route.useLoaderData();

  return (
    <>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <Link to="/yoga" className="eyebrow text-gold hover:text-wine">← Yoga</Link>
        <header className="mt-8">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-gold">{articles.tarjetas}</span>
            <span className="eyebrow text-clay">{articles.date_label}</span>
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-6xl">{articles.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/75">{articles.description}</p>
        </header>

        {articles.cover_image_url && (
          <img src={articles.cover_image_url} alt="" className="mt-12 w-full object-cover" />
        )}

        {articles.body && (
          <div
            className="prose prose-lg mt-12 max-w-none text-ink/85 prose-headings:font-display prose-headings:text-ink prose-a:text-wine prose-strong:text-ink"
            dangerouslySetInnerHTML={{ __html: articles.body }}
          />
        )}

        <hr className="mt-20 border-border/50" />

        <div className="mt-12">
          <Link to="/yoga" className="eyebrow text-wine hover:text-gold">← Volver a Yoga</Link>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <p className="eyebrow text-gold">Sigue leyendo</p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {related.map((r: YogaArticles) => (
                <Link key={r.id} to="/yoga/$slug" params={{ slug: r.slug }} className="group block border border-border p-6 transition-colors hover:border-gold">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-gold/80">{r.tarjetas}</span>
                    <span className="eyebrow text-gold/80">{r.date_label}</span>
                  </div>
                  <h3 className="mt-3 font-display text-xl text-ink group-hover:text-wine">{r.title}</h3>
                  <p className="mt-2 text-sm text-ink/70 line-clamp-3">{r.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}