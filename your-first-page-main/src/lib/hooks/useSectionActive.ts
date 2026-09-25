import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SectionId =
  | "diario"
  | "astrologia"
  | "yoga"
  | "recursos"
  | "servicios"
  | "eventos"
  | "sobre-mi"
  | "app";

export function useSectionActive(section: SectionId) {
  const [active, setActive] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_sections")
      .select("active")
      .eq("id", section)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) setActive(true);
        else setActive(data.active !== false);
      });
    return () => {
      cancelled = true;
    };
  }, [section]);

  return active;
}

export function useSectionFlags() {
  const [flags, setFlags] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_sections")
      .select("id, active")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setFlags({});
          return;
        }
        const map: Record<string, boolean> = {};
        for (const row of data) map[row.id] = row.active !== false;
        setFlags(map);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return flags;
}

export function sectionIsOpen(flags: Record<string, boolean> | null, id: string) {
  if (!flags || !(id in flags)) return true;
  return flags[id];
}
