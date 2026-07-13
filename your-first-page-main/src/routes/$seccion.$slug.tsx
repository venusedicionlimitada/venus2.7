import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "../components/SiteHeader";

type Entry = {
  id: string; slug: string; date_label: string; title: string;
  subtitle: string | null; description: string; body: string | null; 
  cover_image_url: string | null; tarjetas: string | null;
  categoria_emocional: string | null;
};

async function fetchEntry(seccion: string, slug: string): Promise<{ entry: Entry; related: Entry[] }> {
  const tablaMapeo: Record<string, string> = {
    diario: "diary_entries",
    astrologia: "astrology_articles",
    yoga: "yoga_articles"
  };
  const nombreTabla = tablaMapeo[seccion] || "diary_entries";
  const campoTarjeta = seccion === "diario" ? "tarjeta" : "tarjetas";

  const { data, error } = await supabase
    .from(nombreTabla)
    .select(`id, slug, date_label, title, subtitle, description, body, cover_image_url, ${campoTarjeta}, categoria_emocional`)
    .eq("slug", slug).eq("published", true).maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();

  const { data: rel } = await supabase
    .from(nombreTabla)
    .select(`id, slug, date_label, title, subtitle, description, body, cover_image_url, ${campoTarjeta}, categoria_emocional`)
    .eq("published", true).neq("slug", slug).order("sort_order").limit(2);

  const entryNormalizada = {
    ...data,
    tarjetas: (data as any)[campoTarjeta]
  } as Entry;

  const relNormalizada = (rel ?? []).map(r => ({
    ...r,
    tarjetas: (r as any)[campoTarjeta]
  })) as Entry[];

  return { entry: entryNormalizada, related: relNormalizada };
}

export const Route = createFileRoute("/$seccion/$slug")({
  loader: ({ params }) => fetchEntry(params.seccion, params.slug),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Entrada no encontrada" }, { name: "robots", content: "noindex" }] };
    const { entry } = loaderData;
    return {
      meta: [
        { title: `${entry.title} · ${params.seccion}` },
        { name: "description", content: entry.description },
        { property: "og:title", content: entry.title },
        { property: "og:description", content: entry.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/${params.seccion}/${params.slug}` },
        ...(entry.cover_image_url ? [{ property: "og:image", content: entry.cover_image_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/${params.seccion}/${params.slug}` }],
    };
  },
  component: DiaryDetail,
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl text-ink">No hemos podido cargar la entrada</h1>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-8 border border-gold px-6 py-3 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors">Reintentar</button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="eyebrow text-gold">404</p>
      <h1 className="mt-4 font-display text-4xl text-ink">Esta entrada no existe</h1>
      <Link to="/$seccion" params={{ seccion: Route.useParams().seccion }} className="mt-8 inline-block border border-wine px-6 py-3 text-xs uppercase tracking-[0.3em] text-wine hover:bg-wine hover:text-cream transition-colors">Volver al diario</Link>
    </div>
  ),
});

function DiaryDetail() {
  const { entry, related } = Route.useLoaderData();
  const { seccion } = Route.useParams();

  const clasesSeccion: Record<string, string> = {
    yoga: "section-card-yoga",
    diario: "section-card-diario",
    astrologia: "section-forest"
  };

  const claseActiva = clasesSeccion[seccion] || "";

  return (
    <>
      <SiteHeader />
      <div className={claseActiva}>
        <article className="mx-auto max-w-5xl px-6 py-20">
          
          {entry.cover_image_url ? (
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12 items-start mt-8">
              <div className="w-full">
                <img 
                  src={entry.cover_image_url} 
                  alt="" 
                  className="object-cover block w-full h-auto" 
                  style={{
                    width: "300px",
                    height: "auto"
                  }}
                />
              </div>
              
              <header className="w-full flex flex-col">
                <div className="w-full flex justify-between items-center">
                  <span className="eyebrow text-gold">{entry.tarjetas}</span>
                  <span className="eyebrow text-clay" style={{ textAlign: "right" }}>{entry.date_label}</span>
                </div>
                <h1 
                  className="mt-4 font-display leading-tight text-ink w-full break-words"
                  style={{ fontSize: "60px" }}
                >
                  {entry.title}
                </h1>
                {entry.subtitle && (
                  <p 
                    className="mt-4 font-sans leading-relaxed text-ink w-full"
                    style={{ fontSize: "22px" }}
                  >
                    {entry.subtitle}
                  </p>
                )}
                <p 
                  className="mt-6 leading-relaxed text-ink/75 w-full"
                  style={{ fontSize: "18px" }}
                >
                  {entry.description}
                </p>
              </header>
            </div>
          ) : (
            <header className="mt-8 w-full flex flex-col">
              <div className="w-full flex justify-between items-center">
                <span className="eyebrow text-gold">{entry.tarjetas}</span>
                <span className="eyebrow text-clay" style={{ textAlign: "right" }}>{entry.date_label}</span>
              </div>
              <h1 
                className="mt-4 font-display leading-tight text-ink w-full break-words"
                style={{ fontSize: "60px" }}
              >
                {entry.title}
              </h1>
              {entry.subtitle && (
                <p 
                  className="mt-4 font-sans leading-relaxed text-ink w-full"
                  style={{ fontSize: "22px" }}
                >
                  {entry.subtitle}
                </p>
              )}
              <p 
                className="mt-6 leading-relaxed text-ink/75 w-full"
                style={{ fontSize: "18px" }}
              >
                {entry.description}
              </p>
            </header>
          )}

          {entry.body && (
            <div
              className="prose prose-lg mt-12 max-w-none text-ink/85 prose-headings:font-display prose-headings:text-ink prose-a:text-wine prose-strong:text-ink w-full"
              style={{ fontSize: "16px" }}
              dangerouslySetInnerHTML={{ __html: entry.body }}
            />
          )}

          {entry.categoria_emocional && (
            <p className="eyebrow text-gold mt-16 mb-2 block">
              {entry.categoria_emocional}
            </p>
          )}

          <hr className={entry.categoria_emocional ? "mt-2 border-border/50" : "mt-20 border-border/50"} />

          <div className="mt-12">
            <Link to="/$seccion" params={{ seccion: Route.useParams().seccion }} className="eyebrow text-gold hover:text-wine">
              ← {Route.useParams().seccion}
            </Link>
          </div>

          {related.length > 0 && (
            <section className="mt-20">
              <p className="eyebrow text-gold">Sigue leyendo</p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {related.map((r: Entry) => (
                  <Link key={r.id} to="/$seccion/$slug" params={{ seccion: Route.useParams().seccion, slug: r.slug }} className="group block border border-border p-6 transition-colors hover:border-gold">
                    <p className="eyebrow text-gold/80">{r.date_label}</p>
                    <h3 className="mt-3 font-display text-xl text-ink group-hover:text-wine">{r.title}</h3>
                    <p className="mt-2 text-sm text-ink/70 line-clamp-3">{r.description}</p>
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