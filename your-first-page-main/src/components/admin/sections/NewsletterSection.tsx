import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GhostButton } from "@/components/admin/AdminUI";

type Subscriber = {
  id: string;
  email: string;
  created_at: string;
};

export function NewsletterSection() {
  const [items, setItems] = useState<Subscriber[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error: queryError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setItems([]);
      return;
    }
    setError(null);
    setItems((data ?? []) as Subscriber[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("¿Borrar este suscriptor?")) return;
    const { error: deleteError } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (deleteError) {
      alert(deleteError.message);
      return;
    }
    load();
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Newsletter</h2>
      <div className="mt-6 space-y-4">
        {items === null && <p className="text-sm text-ink/60">Cargando…</p>}
        {error && <p className="text-sm text-wine">{error}</p>}
        {items?.length === 0 && !error && <p className="text-sm text-ink/60">Todavía no hay suscriptores.</p>}
        {items?.map((item) => (
          <article key={item.id} className="border border-border/60 bg-background p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <a href={`mailto:${item.email}`} className="font-display text-lg text-ink underline-offset-4 hover:underline">
                  {item.email}
                </a>
                <p className="mt-2 text-xs uppercase tracking-widest text-ink/55">
                  {new Date(item.created_at).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <GhostButton onClick={() => remove(item.id)}>Borrar</GhostButton>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
