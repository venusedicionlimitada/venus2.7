import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SectionId } from "@/lib/hooks/useSectionActive";

export function SectionPauseControl({ section }: { section: SectionId }) {
  const [active, setActive] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_sections")
      .select("active")
      .eq("id", section)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (cancelled) return;
        if (queryError) {
          setError(queryError.message);
          setActive(true);
          return;
        }
        setActive(data ? data.active !== false : true);
      });
    return () => {
      cancelled = true;
    };
  }, [section]);

  async function toggle(next: boolean) {
    setActive(next);
    setError(null);
    const res = await supabase.from("site_sections").upsert({ id: section, active: next });
    if (res.error) setError(res.error.message);
  }

  return (
    <div className="mb-8 border border-border/50 bg-background px-5 py-4">
      <label className="flex items-center gap-2 text-sm text-ink/80">
        <input
          type="checkbox"
          checked={active !== false}
          disabled={active === null}
          onChange={(e) => toggle(e.target.checked)}
        />
        Sección activada
      </label>
      <p className="mt-2 text-xs text-ink/55">
        Desactivada: la página sigue en el menú, con su color, y solo muestra «Próximamente».
      </p>
      {error && <p className="mt-2 text-xs text-wine">{error}</p>}
    </div>
  );
}
