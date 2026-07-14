import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section, ItemRow, EditorModal, Label, TextInput, TextArea, PrimaryButton, GhostButton } from "@/components/admin/AdminUI";

type ServiceRow = {
  id: string; num: string; title: string; duration: string; body: string;
  published: boolean; sort_order: number;
  tags: string | null; categoria_emocional: string | null;
};

export function ServicesSection() {
  const [items, setItems] = useState<ServiceRow[] | null>(null);
  const [editing, setEditing] = useState<Partial<ServiceRow> | null>(null);

  async function load() {
    const { data } = await supabase.from("services").select("*").order("sort_order", { ascending: false });
    setItems((data ?? []) as ServiceRow[]);
  }
  useEffect(() => { load(); }, []);

  async function save(form: Partial<ServiceRow>) {
    const payload = {
      num: form.num ?? "", title: form.title ?? "", duration: form.duration ?? "",
      body: form.body ?? "", published: form.published ?? true, sort_order: form.sort_order ?? 0,
      tags: form.tags ?? null, categoria_emocional: form.categoria_emocional ?? null,
    };
    const res = form.id
      ? await supabase.from("services").update(payload).eq("id", form.id)
      : await supabase.from("services").insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null); load();
  }

  async function remove(id: string) {
    if (!confirm("¿Borrar esta terapia?")) return;
    await supabase.from("services").delete().eq("id", id);
    load();
  }

  return (
    <Section
      title="Terapias"
      onNew={() => setEditing({ published: true, sort_order: (items?.length ?? 0) + 1 })}
      items={items}
      renderItem={(it) => (
        <ItemRow key={it.id} title={`${it.num} · ${it.title}`} subtitle={it.duration} published={it.published}
          onEdit={() => setEditing(it)} onDelete={() => remove(it.id)} />
      )}
      modal={editing && (
        <EditorModal title={editing.id ? "Editar terapia" : "Nueva terapia"} onClose={() => setEditing(null)}>
          <ServiceForm initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />
        </EditorModal>
      )}
    />
  );
}

function ServiceForm({ initial, onSubmit, onCancel }: {
  initial: Partial<ServiceRow>; onSubmit: (v: Partial<ServiceRow>) => void | Promise<void>; onCancel: () => void;
}) {
  const [v, setV] = useState<Partial<ServiceRow>>(initial);
  const [busy, setBusy] = useState(false);
  return (
    <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); await onSubmit(v); setBusy(false); }} className="space-y-4">
      <div className="grid grid-cols-[100px_1fr] gap-3">
        <div><Label>Número</Label><TextInput required value={v.num ?? ""} onChange={(e) => setV({ ...v, num: e.target.value })} placeholder="I" /></div>
        <div><Label>Título</Label><TextInput required value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value })} /></div>
      </div>
      <div><Label>Duración / formato</Label><TextInput required value={v.duration ?? ""} onChange={(e) => setV({ ...v, duration: e.target.value })} placeholder="60 min · online" /></div>
      <div><Label>Descripción</Label><TextArea required rows={5} value={v.body ?? ""} onChange={(e) => setV({ ...v, body: e.target.value })} /></div>
      <div><Label>Etiquetas</Label><TextInput value={v.tags ?? ""} onChange={(e) => setV({ ...v, tags: e.target.value })} placeholder="ej. Sesión, Acompañamiento, Online" /></div>
      <div><Label>Categoría Emocional</Label><TextInput value={v.categoria_emocional ?? ""} onChange={(e) => setV({ ...v, categoria_emocional: e.target.value })} placeholder="ej. Sanación, Sombra, Integración" /></div>
      <div className="flex items-center gap-3">
        <Label>Orden</Label><TextInput type="number" value={v.sort_order ?? 0} onChange={(e) => setV({ ...v, sort_order: Number(e.target.value) })} className="!w-24 !mt-0" />
        <label className="ml-6 flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={!!v.published} onChange={(e) => setV({ ...v, published: e.target.checked })} />
          Publicada
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-4"><GhostButton type="button" onClick={onCancel}>Cancelar</GhostButton><PrimaryButton type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</PrimaryButton></div>
    </form>
  );
}