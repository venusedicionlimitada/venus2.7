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

export type AppGalleryLine = {
  id?: string;
  body: string;
};

const FALLBACK_GALLERY_LINES: AppGalleryLine[] = [
  { body: "Clima Astral" },
  { body: "Así está el cielo hoy para ti" },
  { body: "Lee los tránsitos de tu carta" },
  { body: "Tu carta natal" },
  { body: "Informes de tu carta natal personalizados" },
  { body: "Aprende sobre tu manera de amar, tu vocación o tus raíces" },
  { body: "Descubre las lecturas que Venus realiza a tu carta" },
];

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

function toCapture(row: { id: string; image_url: string; alt: string | null }): AppCapture {
  return {
    id: row.id,
    src: row.image_url,
    alt: row.alt?.trim() || "Captura de Venus App",
  };
}

export function useAppContent() {
  const [reviews, setReviews] = useState<AppReview[]>(FALLBACK_REVIEWS);
  const [captures, setCaptures] = useState<AppCapture[]>([]);
  const [cartaCaptures, setCartaCaptures] = useState<AppCapture[]>([]);
  const [galleryCaptures, setGalleryCaptures] = useState<AppCapture[]>([]);
  const [galleryLines, setGalleryLines] = useState<AppGalleryLine[]>(FALLBACK_GALLERY_LINES);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [photoRes, reviewRes, lineRes] = await Promise.all([
        supabase.from("app_photos").select("id, image_url, alt, sort_order, slot").order("sort_order", { ascending: true }),
        supabase.from("app_reviews").select("id, quote, name, label, sort_order").order("sort_order", { ascending: true }),
        supabase.from("app_gallery_lines").select("id, body, sort_order").order("sort_order", { ascending: true }),
      ]);

      if (cancelled) return;

      if (!photoRes.error && photoRes.data) {
        const responde = photoRes.data.filter((row) => row.slot !== "carta" && row.slot !== "galeria");
        const carta = photoRes.data.filter((row) => row.slot === "carta");
        const galeria = photoRes.data.filter((row) => row.slot === "galeria");
        setCaptures(responde.map(toCapture));
        setCartaCaptures(carta.map(toCapture));
        setGalleryCaptures(galeria.map(toCapture));
      } else if (photoRes.error) {
        const legacy = await supabase
          .from("app_photos")
          .select("id, image_url, alt, sort_order")
          .order("sort_order", { ascending: true });
        if (cancelled) return;
        if (!legacy.error && legacy.data) setCaptures(legacy.data.map(toCapture));
      }

      if (!lineRes.error && lineRes.data && lineRes.data.length > 0) {
        setGalleryLines(lineRes.data.map((row) => ({ id: row.id, body: row.body })));
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

  return { reviews, captures, cartaCaptures, galleryCaptures, galleryLines };
}
