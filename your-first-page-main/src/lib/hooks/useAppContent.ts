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

export type AppStep = {
  id?: string;
  marker: string;
  title: string;
  body: string;
};

const FALLBACK_GALLERY_LINES: AppGalleryLine[] = [
  { body: "Clima Astral" },
  { body: "Tu carta natal" },
  { body: "Clima Astral Personalizado" },
  { body: "organiza tu día según los tránsitos" },
  { body: "descubre tus talentos innatos" },
  { body: "Informes de tu carta natal personalizados" },
  { body: "tu lenguaje del amor" },
  { body: "informes natales personalizados" },
  { body: "sinastrías" },
  { body: "descubre el lenguaje del amor de tu pareja" },
  { body: "compatibilidad de amistades" },
  { body: "¿tienes un evento importante? descubre la energía de ese día" },
  { body: "a tu propio ritmo" },
  { body: "resuelve tus dudas" },
  { body: "te ayuda a tomar decisiones" },
  { body: "tu carta natal en la palma de tu mano" },
  { body: "compatibilidad de pareja" },
];

const FALLBACK_STEPS: AppStep[] = [
  {
    marker: "01",
    title: "Consulta astrológica con tu carta",
    body: "Pregunta tus inquietudes",
  },
  {
    marker: "02",
    title: "Tu configuración astral",
    body: "Siempre disponible",
  },
  {
    marker: "03",
    title: "Informes personalizados de tu carta natal",
    body: "Tu mapa al detalle",
  },
  {
    marker: "04",
    title: "Sinastrías",
    body: "Compatibilidad con tus vínculos",
  },
  {
    marker: "05",
    title: "Consulta de sinastrías",
    body: "Pregúntale al instante acerca de vuestra relación",
  },
  {
    marker: "06",
    title: "Clima Astral",
    body: "La energía del día que quieras",
  },
  {
    marker: "07",
    title: "Clima Astral Personalizado",
    body: "Descubre la energía disponible para ti",
  },
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
  const [steps, setSteps] = useState<AppStep[]>(FALLBACK_STEPS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [photoRes, reviewRes, stepRes] = await Promise.all([
        supabase.from("app_photos").select("id, image_url, alt, sort_order, slot").order("sort_order", { ascending: true }),
        supabase.from("app_reviews").select("id, quote, name, label, sort_order").order("sort_order", { ascending: true }),
        supabase.from("app_steps").select("id, marker, title, body, sort_order").order("sort_order", { ascending: true }),
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

      if (!stepRes.error && stepRes.data) {
        const extra = stepRes.data
          .map((row) => ({
            id: row.id,
            marker: row.marker,
            title: row.title,
            body: row.body,
          }))
          .filter(
            (row) =>
              row.title !== "Tu configuración astral siempre disponible" &&
              !FALLBACK_STEPS.some((step) => step.title === row.title && step.body === row.body),
          );
        setSteps([...FALLBACK_STEPS, ...extra]);
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

  return { reviews, captures, cartaCaptures, galleryCaptures, galleryLines: FALLBACK_GALLERY_LINES, steps };
}
