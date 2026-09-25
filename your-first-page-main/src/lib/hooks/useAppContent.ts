import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppReview = {
  id?: string;
  quote: string;
  name: string;
  label: string;
};

export type AppCapture = {
  id: string;
  src: string;
  alt: string;
};

const FALLBACK_REVIEWS: AppReview[] = [
  {
    quote: "Le escribí de noche, sin preparar nada. Venus me devolvió el patrón del vínculo, no un consejo.",
    name: "Marta",
    label: "Venusina",
  },
  {
    quote: "Abrí la sinastría y por fin vi la carta de los dos en la misma conversación.",
    name: "Lucía",
    label: "Venusina",
  },
  {
    quote: "Puedo parar y volver. No es una sesión con hora: es mi carta, cuando yo quiero seguir.",
    name: "Elena",
    label: "Venusina",
  },
];

export function useAppContent() {
  const [reviews, setReviews] = useState<AppReview[]>(FALLBACK_REVIEWS);
  const [captures, setCaptures] = useState<AppCapture[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [photoRes, reviewRes] = await Promise.all([
        supabase.from("app_photos").select("id, image_url, alt, sort_order").order("sort_order", { ascending: true }),
        supabase.from("app_reviews").select("id, quote, name, label, sort_order").order("sort_order", { ascending: true }),
      ]);

      if (cancelled) return;

      if (!photoRes.error && photoRes.data) {
        setCaptures(
          photoRes.data.map((row) => ({
            id: row.id,
            src: row.image_url,
            alt: row.alt?.trim() || "Captura de Venus App",
          })),
        );
      }

      if (!reviewRes.error && reviewRes.data && reviewRes.data.length > 0) {
        setReviews(
          reviewRes.data.map((row) => ({
            id: row.id,
            quote: row.quote,
            name: row.name,
            label: row.label,
          })),
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { reviews, captures };
}
