import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "../components/SiteHeader";

type Entry = {
  id: string; slug: string; date_label: string; title: string;
  description: string; body: string | null; cover_image_url: string | null;
};

async function fetchEntry(slug: string): Promise<{ entry: Entry; related: Entry[] }> {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("id, slug, date_label, title, description, body, cover_image_url")
    .eq("slug", slug).eq("published", true).maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();

  const { data: rel } = await supabase
    .from("diary_entries")
    .select("id, slug, date_label, title, description, body, cover_image_url")
    .eq("published", true).neq("slug", slug).order("sort_order").limit(2);
  return { entry: data as Entry, related: (rel ?? []) as Entry[] };
}

export const Route = createFileRoute("/diario/$slug")({
  loader: ({ params }) => fetchEntry(params.slug),
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Entrada no encontrada" }, { name: "robots", content: "noindex" }] };
    const { entry } = loaderData;
    return {
      meta: [
        { title: `${entry.title} · Diario` },
        { name: "description", content: entry.description },
        { property: "og:title", content: entry.title },
        { property: "og:description", content: entry.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/diario/${params.slug}` },
        ...(entry.cover_image_url ? [{ property: "og:image", content: entry.cover_image_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/diario/${params.slug}` }],
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
      <Link to="/diario" className="mt-8 inline-block border border-wine px-6 py-3 text-xs uppercase tracking-[0.3em] text-wine hover:bg-wine hover:text-cream transition-colors">Volver al diario</Link>
    </div>
  ),
});

function DiaryDetail() {
  const { entry, related } = Route.useLoaderData();

  return (
    <>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <Link to="/diario" className="eyebrow text-gold hover:text-wine">← Diario</Link>
        <header className="mt-8">
          <p className="eyebrow text-clay">{entry.date_label}</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-6xl">{entry.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/75">{entry.description}</p>
        </header>

        {entry.cover_image_url && (
          <img src={entry.cover_image_url} alt="" className="mt-12 w-full object-cover" />
        )}

        {entry.body && (
          <div
            className="prose prose-lg mt-12 max-w-none text-ink/85 prose-headings:font-display prose-headings:text-ink prose-a:text-wine prose-strong:text-ink"
            dangerouslySetInnerHTML={{ __html: entry.body }}
          />
        )}

        <hr className="mt-20 border-border/50" />

        <div className="mt-12">
          <Link to="/diario" className="eyebrow text-wine hover:text-gold">← Volver al diario</Link>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <p className="eyebrow text-gold">Sigue leyendo</p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {related.map((r: Entry) => (
                <Link key={r.id} to="/diario/$slug" params={{ slug: r.slug }} className="group block border border-border p-6 transition-colors hover:border-gold">
                  <p className="eyebrow text-gold/80">{r.date_label}</p>
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