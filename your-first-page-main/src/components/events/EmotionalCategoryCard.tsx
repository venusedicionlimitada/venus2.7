import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CategoryDetailSheet } from "@/components/events/CategoryDetailSheet";

export type EmotionFicha = {
  nombre: string;
  subtitulo: string | null;
  extracto: string | null;
  descripcion: string | null;
  cover_image_url: string | null;
};

export function fichaPorNombre(fichas: EmotionFicha[], nombre: string) {
  const clave = nombre.trim().toLowerCase();
  return fichas.find((ficha) => ficha.nombre.trim().toLowerCase() === clave) ?? null;
}

type EventoConEmocion = {
  categoria_emocional?: string | null;
  cover_image_url?: string | null;
};

export function tarjetasDeEmocion(events: EventoConEmocion[], fichas: EmotionFicha[]) {
  const map = new Map<string, {
    nombre: string;
    representative: { cover_image_url?: string | null };
    ficha: EmotionFicha | null;
  }>();

  fichas.forEach((ficha) => {
    const nombre = ficha.nombre.trim();
    if (!nombre) return;
    const representative = events.find((event) =>
      (event.categoria_emocional ?? "")
        .split(",")
        .map((parte) => parte.trim().toLowerCase())
        .includes(nombre.toLowerCase()),
    );
    map.set(nombre.toLowerCase(), {
      nombre,
      representative: representative ?? { cover_image_url: null },
      ficha,
    });
  });

  events.forEach((event) => {
    if (!event.categoria_emocional) return;
    event.categoria_emocional.split(",").map((parte) => parte.trim()).filter(Boolean).forEach((cat) => {
      const clave = cat.toLowerCase();
      if (map.has(clave)) return;
      map.set(clave, {
        nombre: cat,
        representative: event,
        ficha: fichaPorNombre(fichas, cat),
      });
    });
  });

  return Array.from(map.values());
}

export function EmotionalCategoryCard({
  cat,
}: {
  cat: {
    nombre: string;
    representative: { cover_image_url?: string | null };
    ficha?: EmotionFicha | null;
  };
}) {
  const subtitulo = cat.ficha?.subtitulo?.trim() || "";
  const extracto = cat.ficha?.extracto?.trim() || "";
  const descripcion = cat.ficha?.descripcion?.trim() || "";
  const foto = cat.ficha?.cover_image_url || cat.representative.cover_image_url;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative w-full">
          <article className="w-full h-full cursor-pointer group flex flex-col border border-cream/20 bg-cream/5 p-6 sm:p-8 transition-colors hover:border-gold">
            {foto && (
              <img src={foto} alt="" className="mb-6 max-h-60 w-full object-cover" />
            )}
            <h2 className="font-sans text-2xl font-normal leading-snug text-gold">{cat.nombre}</h2>
            {subtitulo && (
              <p className="mt-3 font-sans text-xl font-light italic leading-snug text-cream/90">{subtitulo}</p>
            )}
            <p className="mt-4 text-base leading-relaxed text-cream/65">
              {extracto || "Explorar herramientas y conexiones para esta sintonía."}
            </p>
          </article>
        </div>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl bg-background border-l border-gold/70 p-0 overflow-y-auto">
        <CategoryDetailSheet categoria={cat.nombre} descripcion={descripcion} />
      </SheetContent>
    </Sheet>
  );
}
