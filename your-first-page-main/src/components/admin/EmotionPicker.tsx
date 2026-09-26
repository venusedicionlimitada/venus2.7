import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/admin/AdminUI";

function partes(value: string | null | undefined) {
  if (!value) return [];
  return value.split(",").map((parte) => parte.trim()).filter(Boolean);
}

export function EmotionPicker({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (next: string | null) => void;
}) {
  const [emociones, setEmociones] = useState<{ id: string; nombre: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("emociones")
      .select("id, nombre")
      .order("sort_order")
      .order("nombre")
      .then(({ data, error: loadError }) => {
        if (loadError) {
          setError(loadError.message);
          setEmociones([]);
          return;
        }
        setEmociones(data ?? []);
      });
  }, []);

  const selected = partes(value);
  const conocidas = new Set((emociones ?? []).map((emocion) => emocion.nombre.trim().toLowerCase()));
  const huerfanas = selected.filter((nombre) => !conocidas.has(nombre.toLowerCase()));

  function toggle(nombre: string) {
    const queda = selected.some((actual) => actual.toLowerCase() === nombre.toLowerCase());
    const next = queda
      ? selected.filter((actual) => actual.toLowerCase() !== nombre.toLowerCase())
      : [...selected, nombre];
    onChange(next.length ? next.join(", ") : null);
  }

  return (
    <div>
      <Label>Astrología emocional</Label>
      {emociones === null && <p className="mt-2 text-xs text-ink/60">Cargando emociones…</p>}
      {error && <p className="mt-2 text-xs text-wine">{error}</p>}
      {emociones?.length === 0 && !error && (
        <p className="mt-2 text-xs text-ink/60">
          Aún no hay emociones. Créalas en el apartado Astrología emocional.
        </p>
      )}
      <div className="mt-2 flex flex-col gap-2">
        {emociones?.map((emocion) => (
          <label key={emocion.id} className="flex items-center gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={selected.some((actual) => actual.toLowerCase() === emocion.nombre.toLowerCase())}
              onChange={() => toggle(emocion.nombre)}
            />
            {emocion.nombre}
          </label>
        ))}
        {huerfanas.map((nombre) => (
          <label key={nombre} className="flex items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" checked onChange={() => toggle(nombre)} />
            {nombre}
            <span className="text-xs text-ink/50">ya estaba escrita, sin ficha todavía</span>
          </label>
        ))}
      </div>
    </div>
  );
}
