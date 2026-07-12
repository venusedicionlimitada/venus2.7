import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { requestResourceDownload } from "@/lib/resources.functions";
import { SiteHeader } from "../components/SiteHeader";

export const Route = createFileRoute("/recursos")({
  head: () => ({
    meta: [
      { title: "Recursos · Venus Edición Limitada" },
      { name: "description", content: "Descargables gratuitos: secuencias de yoga, plantillas astrológicas y rituales para casa." },
      { property: "og:title", content: "Recursos · Venus" },
      { property: "og:description", content: "Descargables de yoga y astrología a cambio de tu email." },
    ],
  }),
  component: Recursos,
});

type Resource = { id: string; type: string; title: string; description: string; file_path: string | null };

function Recursos() {
  const [items, setItems] = useState<Resource[] | null>(null);
  const [selected, setSelected] = useState<Resource | null>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const requestDownload = useServerFn(requestResourceDownload);

  useEffect(() => {
    supabase.from("resources")
      .select("id, type, title, description, file_path")
      .eq("published", true).order("sort_order")
      .then(({ data }) => setItems((data ?? []) as Resource[]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setState("sending"); setErrorMsg(null);
    try {
      const res = await requestDownload({ data: { resourceId: selected.id, email } });
      if (res.ok) { setDownloadUrl(res.url); setState("ok"); }
      else { setErrorMsg(res.error); setState("error"); }
    } catch {
      setErrorMsg("Error de conexión. Inténtalo de nuevo."); setState("error");
    }
  }

  function closeModal() {
    setSelected(null); setEmail(""); setState("idle"); setDownloadUrl(null); setErrorMsg(null);
  }

  return (
    <>
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <header className="text-center">
          <p className="eyebrow text-gold">Recursos</p>
          <h1 className="mt-6 font-display text-5xl text-ink md:text-7xl">Para llevarte a casa.</h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-ink/75">
            Pequeños tesoros descargables. A cambio, solo te pido tu correo electrónico — así nos mantenemos en contacto y te aviso de lo nuevo.
          </p>
        </header>

        {items === null ? (
          <p className="mt-20 text-center text-sm text-ink/60">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="mt-20 text-center text-sm text-ink/60">Pronto.</p>
        ) : (
          <div className="mt-20 grid gap-6 md:grid-cols-2">
            {items.map((r) => (
              <article key={r.id} className="flex flex-col justify-between border border-border/40 bg-card p-8">
                <div>
                  <p className="eyebrow text-gold">{r.type}</p>
                  <h2 className="mt-4 font-display text-2xl text-ink md:text-3xl">{r.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink/75">{r.description}</p>
                </div>
                <button
                  onClick={() => { setSelected(r); setState("idle"); setEmail(""); }}
                  disabled={!r.file_path}
                  className="mt-8 self-start border border-gold px-6 py-3 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {r.file_path ? "Descargar gratis" : "Próximamente"}
                </button>
              </article>
            ))}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm" onClick={closeModal}>
            <div className="relative w-full max-w-md border border-gold/40 bg-card p-10" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeModal} className="absolute right-5 top-5 text-ink/60 hover:text-gold" aria-label="Cerrar">✕</button>

              {state === "ok" && downloadUrl ? (
                <div className="text-center">
                  <p className="eyebrow text-gold">{selected.title}</p>
                  <h3 className="mt-4 font-display text-3xl text-ink">Aquí está.</h3>
                  <p className="mt-4 text-sm text-ink/75">Tu enlace de descarga está listo (válido durante 1 hora).</p>
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-6 inline-block border border-gold bg-gold/10 px-6 py-3 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors">
                    Descargar PDF
                  </a>
                </div>
              ) : (
                <>
                  <p className="eyebrow text-gold">{selected.title}</p>
                  <h3 className="mt-4 font-display text-3xl text-ink">Déjame tu correo</h3>
                  <p className="mt-3 text-sm text-ink/70">Te genero el enlace de descarga al instante.</p>
                  <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <input
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full border border-border bg-background/50 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none"
                    />
                    {errorMsg && <p className="text-sm text-wine">{errorMsg}</p>}
                    <button type="submit" disabled={state === "sending"}
                      className="w-full border border-gold bg-gold/10 px-6 py-3 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors disabled:opacity-50">
                      {state === "sending" ? "Un momento…" : "Generar enlace"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}