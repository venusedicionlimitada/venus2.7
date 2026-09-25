import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Label, TextInput, TextArea, GhostButton, PrimaryButton } from "@/components/admin/AdminUI";
import { RichTextEditor } from "@/components/RichTextEditor";
import { SectionPauseControl } from "@/components/admin/SectionPauseControl";

type SobreMiRow = {
  id: string;
  title: string;
  lead: string | null;
  body: string | null;
  formacion: string | null;
};

const EMPTY: Omit<SobreMiRow, "id"> = {
  title: "",
  lead: "",
  body: "",
  formacion: "",
};

export function SobreMiSection() {
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function load() {
    const { data, error: queryError } = await supabase
      .from("sobre_mi")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    if (data) {
      const row = data as SobreMiRow;
      setId(row.id);
      setForm({
        title: row.title ?? "",
        lead: row.lead ?? "",
        body: row.body ?? "",
        formacion: row.formacion ?? "",
      });
    }
    setError(null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const payload = {
      title: form.title.trim(),
      lead: form.lead?.trim() || null,
      body: form.body || null,
      formacion: form.formacion?.trim() || null,
    };

    const res = id
      ? await supabase.from("sobre_mi").update(payload).eq("id", id)
      : await supabase.from("sobre_mi").insert(payload).select("id").single();

    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (!id && res.data && "id" in res.data) setId((res.data as { id: string }).id);
    setSaved(true);
  }

  if (loading) return <p className="text-sm text-ink/60">Cargando…</p>;

  return (
    <div>
      <SectionPauseControl section="sobre-mi" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-2xl text-ink">Sobre mí</h2>
        <Link to="/sobre-mi" className="text-[0.7rem] uppercase tracking-[0.25em] text-ink/60 hover:text-gold">
          Ver página →
        </Link>
      </div>

      <form onSubmit={save} className="mt-8 max-w-2xl space-y-5">
        <div>
          <Label>Título</Label>
          <TextInput
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="El gesto de acompañar."
          />
        </div>
        <div>
          <Label>Frase de apertura</Label>
          <TextArea
            rows={2}
            value={form.lead ?? ""}
            onChange={(e) => setForm({ ...form, lead: e.target.value })}
            placeholder="Bienvenida. Este es un espacio íntimo, hecho a fuego lento."
          />
        </div>
        <div>
          <Label>Texto</Label>
          <div className="mt-2">
            <RichTextEditor
              value={form.body ?? ""}
              onChange={(html) => setForm({ ...form, body: html })}
            />
          </div>
        </div>
        <div>
          <Label>Formación (una línea por ítem)</Label>
          <TextArea
            rows={5}
            value={form.formacion ?? ""}
            onChange={(e) => setForm({ ...form, formacion: e.target.value })}
            placeholder={"[Formación 1]\n[Formación 2]"}
          />
        </div>

        {error && <p className="text-sm text-wine">{error}</p>}
        {saved && !error && <p className="text-sm text-ink/70">Guardado.</p>}

        <div className="flex justify-end gap-3 pt-2">
          <GhostButton type="button" onClick={() => load()}>Descartar</GhostButton>
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
