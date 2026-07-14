import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section, ItemRow, EditorModal, Label, TextInput, TextArea, PrimaryButton, GhostButton } from "@/components/admin/AdminUI";
import { uploadImage } from "@/lib/utils";

type EventRow = {
  id: string; titulo: string; subtitulo: string; description: string; 
  cover_image_url: string | null; fecha_evento: string; hora_evento: string;
  published: boolean; related_article_ids: string[]; sort_order: number;
  tags: string | null; categoria_emocional: string | null;
};

export function EventsSection() {
  const [items, setItems] = useState<EventRow[] | null>(null);
  const [editing, setEditing] = useState<Partial<EventRow> | null>(null);

  async function load() {
    const { data } = await supabase.from("lunar_events").select("*").order("sort_order", { ascending: false });
    setItems((data ?? []) as EventRow[]);
  }
  useEffect(() => { load(); }, []);

  async function save(form: Partial<EventRow>) {
    const payload = {
      titulo: form.titulo ?? "", subtitulo: form.subtitulo ?? "", description: form.description ?? "",
      cover_image_url: form.cover_image_url ?? null, fecha_evento: form.fecha_evento ?? "",
      hora_evento: form.hora_evento ?? "", published: form.published ?? false,
      related_article_ids: form.related_article_ids ?? [], sort_order: form.sort_order ?? 0,
      tags: form.tags ?? null, categoria_emocional: form.categoria_emocional ?? null,
    };
    const res = form.id
      ? await supabase.from("lunar_events").update(payload).eq("id", form.id)
      : await supabase.from("lunar_events").insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null); load();
  }

  async function remove(id: string) {
    if (!confirm("¿Borrar este evento lunar?")) return;
    await supabase.from("lunar_events").delete().eq("id", id);
    load();
  }

  return (
    <Section
      title="Eventos Lunares"
      onNew={() => setEditing({ published: false, sort_order: (items?.length ?? 0) + 1 })}
      items={items}
      renderItem={(it) => (
        <ItemRow key={it.id} title={it.titulo} subtitle={`${it.fecha_evento} ${it.hora_evento}`} published={it.published}
          onEdit={() => setEditing(it)} onDelete={() => remove(it.id)} />
      )}
      modal={editing && (
        <EditorModal title={editing.id ? "Editar evento" : "Nuevo evento"} onClose={() => setEditing(null)}>
          <EventForm initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />
        </EditorModal>
      )}
    />
  );
}

function EventForm({ initial, onSubmit, onCancel }: {
  initial: Partial<EventRow>; onSubmit: (v: Partial<EventRow>) => void | Promise<void>; onCancel: () => void;
}) {
  const [v, setV] = useState<Partial<EventRow>>(initial);
  const [busy, setBusy] = useState(false);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try { setV({ ...v, cover_image_url: await uploadImage(f) }); }
    catch (err) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); await onSubmit(v); setBusy(false); }} className="space-y-4">
      <div><Label>Título</Label><TextInput required value={v.titulo ?? ""} onChange={(e) => setV({ ...v, titulo: e.target.value })} /></div>
      <div><Label>Subtítulo</Label><TextInput required value={v.subtitulo ?? ""} onChange={(e) => setV({ ...v, subtitulo: e.target.value })} /></div>
      <div><Label>Descripción</Label><TextArea required rows={3} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Fecha</Label><TextInput type="date" required value={v.fecha_evento ?? ""} onChange={(e) => setV({ ...v, fecha_evento: e.target.value })} /></div>
        <div><Label>Hora</Label><TextInput type="time" required value={v.hora_evento ?? ""} onChange={(e) => setV({ ...v, hora_evento: e.target.value })} /></div>
      </div>
      <div><Label>Etiquetas</Label><TextInput value={v.tags ?? ""} onChange={(e) => setV({ ...v, tags: e.target.value })} placeholder="ej. Círculo, Luna Llena, Ritual" /></div>
      <div><Label>Categoría Emocional</Label><TextInput value={v.categoria_emocional ?? ""} onChange={(e) => setV({ ...v, categoria_emocional: e.target.value })} placeholder="ej. Claridad, Integración, Sombra" /></div>
      <div>
        <Label>Imagen</Label>
        {v.cover_image_url && <img src={v.cover_image_url} alt="" className="mt-2 max-h-40 border border-border" />}
        <input type="file" accept="image/*" onChange={handleImage} className="mt-2 text-xs text-ink/70" />
      </div>
      <div className="flex items-center gap-3">
        <Label>Orden</Label><TextInput type="number" value={v.sort_order ?? 0} onChange={(e) => setV({ ...v, sort_order: Number(e.target.value) })} className="!w-24 !mt-0" />
        <label className="ml-6 flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={!!v.published} onChange={(e) => setV({ ...v, published: e.target.checked })} />
          Publicado
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-4"><GhostButton type="button" onClick={onCancel}>Cancelar</GhostButton><PrimaryButton type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</PrimaryButton></div>
    </form>
  );
}