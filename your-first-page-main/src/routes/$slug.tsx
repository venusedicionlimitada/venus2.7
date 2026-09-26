import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "../components/SiteHeader";
import { SectionPaused } from "@/components/SectionPaused";

type LegalPage = {
  title: string;
  body: string | null;
  active: boolean;
  published: boolean;
};

async function fetchLegalPage(slug: string): Promise<LegalPage> {
  const { data, error } = await supabase
    .from("legal_pages")
    .select("title, body, active, published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data || data.published === false) throw notFound();
  return data;
}

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => fetchLegalPage(params.slug),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.title} · Venus Edición Limitada`
          : "Página no encontrada",
      },
    ],
  }),
  component: LegalDocumentPage,
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <>
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-6 py-32 text-center">
          <h1 className="font-display text-3xl text-ink">No hemos podido cargar la página</h1>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="mt-8 border border-gold px-6 py-3 text-xs uppercase tracking-[0.3em] text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
          >
            Reintentar
          </button>
        </div>
      </>
    );
  },
});

function LegalDocumentPage() {
  const page = Route.useLoaderData();
  if (page.active === false) return <SectionPaused />;

  return (
    <>
      <SiteHeader />
      <article className="mx-auto max-w-7xl px-6 pt-10 pb-0 text-left md:px-10 md:pt-12">
        <h1 className="font-sans text-xl font-medium uppercase leading-snug tracking-[0.06em] text-black md:text-2xl">
          {page.title}
        </h1>
        {page.body && (
          <div
            className="prose prose-p:leading-normal mt-10 ml-6 mb-24 max-w-none w-full font-sans text-lg text-black md:ml-10 [--tw-prose-body:#000] [--tw-prose-bold:#000] [--tw-prose-bullets:#000] [--tw-prose-counters:#000] [--tw-prose-headings:#000] prose-headings:font-sans prose-headings:font-medium prose-headings:text-black prose-p:text-black prose-strong:text-black [&_h2]:font-sans [&_h3]:font-sans"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        )}
        <hr className="border-0 border-t border-black/30" />
      </article>
    </>
  );
}
