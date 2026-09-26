import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section, ItemRow, EditorModal, Label, TextInput, TextArea, PrimaryButton, GhostButton } from "@/components/admin/AdminUI";
import { uploadImage } from "@/lib/utils";

type EmocionRow = {
  id: string;
  nombre: string;
  subtitulo: string | null;
  extracto: string | null;
  descripcion: string | null;
  cover_image_url: string | null;
  sort_order: number;
  published: boolean;
};

export function EmocionesSection() {
  const [items, setItems] = useState<EmocionRow[] | null>(null);
  const [editing, setEditing] = useState<Partial<EmocionRow> | null>(null);

  async function load() {
    const { data, error } = await supabase.from("emociones").select("*").order("sort_order").order("nombre");
    if (error) {
      alert(error.message);
      setItems([]);
      return;
    }
    setItems((data ?? []) as EmocionRow[]);
  }

  useEffect(() => { load(); }, []);

  async function save(form: Partial<EmocionRow>) {
    const payload = {
      nombre: form.nombre?.trim() ?? "",
      subtitulo: form.subtitulo?.trim() || null,
      extracto: form.extracto?.trim() || null,
      descripcion: form.descripcion?.trim() || null,
      cover_image_url: form.cover_image_url ?? null,
      sort_order: form.sort_order ?? 0,
      published: form.published ?? true,
    };
    const res = form.id
      ? await supabase.from("emociones").update(payload).eq("id", form.id)
      : await supabase.from("emociones").insert(payload);
    if (res.error) {
      alert(res.error.code === "23505" ? "Ya existe una emoción con ese nombre." : res.error.message);
      return;
    }
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("¿Borrar esta emoción? Lo ya escrito en eventos y publicaciones no se borra.")) return;
    const { error } = await supabase.from("emociones").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    load();
  }

  return (
    <Section
      title="Astrología emocional"
      onNew={() => setEditing({ published: true, sort_order: (items?.length ?? 0) + 1 })}
      items={items}
      renderItem={(it) => (
        <ItemRow
          key={it.id}
          title={it.nombre}
          subtitle={it.subtitulo?.trim() || "Sin subtítulo"}
          published={it.published}
          onEdit={() => setEditing(it)}
          onDelete={() => remove(it.id)}
        />
      )}
      modal={editing && (
        <EditorModal title={editing.id ? "Editar emoción" : "Nueva emoción"} onClose={() => setEditing(null)}>
          <EmocionForm initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />
        </EditorModal>
      )}
    />
  );
}

function EmocionForm({ initial, onSubmit, onCancel }: {
  initial: Partial<EmocionRow>;
  onSubmit: (v: Partial<EmocionRow>) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<Partial<EmocionRow>>(initial);
  const [busy, setBusy] = useState(false);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { setV({ ...v, cover_image_url: await uploadImage(file) }); }
    catch (err) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); await onSubmit(v); setBusy(false); }} className="space-y-4">
      <div><Label>Nombre</Label><TextInput required value={v.nombre ?? ""} onChange={(e) => setV({ ...v, nombre: e.target.value })} placeholder="Vulnerabilidad" /></div>
      <div><Label>Subtítulo</Label><TextInput value={v.subtitulo ?? ""} onChange={(e) => setV({ ...v, subtitulo: e.target.value })} placeholder="Abraza lo que sientes" /></div>
      <div><Label>Extracto</Label><TextArea rows={3} value={v.extracto ?? ""} onChange={(e) => setV({ ...v, extracto: e.target.value })} /></div>
      <div><Label>Descripción</Label><TextArea rows={6} value={v.descripcion ?? ""} onChange={(e) => setV({ ...v, descripcion: e.target.value })} /></div>
      <div>
        <Label>Imagen</Label>
        {v.cover_image_url && <img src={v.cover_image_url} alt="" className="mt-2 max-h-40 border border-border" />}
        <input type="file" accept="image/*" onChange={handleImage} className="mt-2 text-xs text-ink/70" />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <Label>Orden</Label>
          <TextInput type="number" value={v.sort_order ?? 0} onChange={(e) => setV({ ...v, sort_order: Number(e.target.value) })} className="!w-24 !mt-0" />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={v.published !== false} onChange={(e) => setV({ ...v, published: e.target.checked })} />
          Publicada
        </label>
      </div>
      <p className="text-xs text-ink/55">El extracto se ve en la tarjeta. La descripción, si la escribes, se ve al abrir el panel. Publicada: salen la foto, el subtítulo y el extracto.</p>
      <div className="flex justify-end gap-3 pt-4">
        <GhostButton type="button" onClick={onCancel}>Cancelar</GhostButton>
        <PrimaryButton type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</PrimaryButton>
      </div>
    </form>
  );
}
