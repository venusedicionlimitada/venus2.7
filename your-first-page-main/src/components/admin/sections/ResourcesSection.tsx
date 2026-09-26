import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/utils";
import { Section, ItemRow, EditorModal, Label, TextInput, TextArea, PrimaryButton, GhostButton } from "@/components/admin/AdminUI";
import { SectionPauseControl } from "@/components/admin/SectionPauseControl";
import { EmotionPicker } from "@/components/admin/EmotionPicker";

type ResourceRow = {
  id: string; type: string; title: string; description: string;
  file_path: string | null; published: boolean; active: boolean; sort_order: number;
  price: number; stripe_price_id: string | null; cover_image_url: string | null;
  tags: string | null; categoria_emocional: string | null;
};

async function uploadResourceFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("resource-files").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });
  if (upErr) throw upErr;
  return path;
}

export function ResourcesSection() {
  const [items, setItems] = useState<ResourceRow[] | null>(null);
  const [editing, setEditing] = useState<Partial<ResourceRow> | null>(null);

  async function load() {
    const { data } = await supabase.from("resources").select("*").order("sort_order", { ascending: false });
    setItems((data ?? []) as ResourceRow[]);
  }
  useEffect(() => { load(); }, []);

  async function save(form: Partial<ResourceRow>) {
    const payload = {
      type: form.type ?? "Secuencia", title: form.title ?? "", description: form.description ?? "",
      file_path: form.file_path ?? null, published: form.published ?? false,
      active: form.active ?? false, sort_order: form.sort_order ?? 0,
      price: Number(form.price ?? 0), stripe_price_id: form.stripe_price_id?.trim() || null,
      cover_image_url: form.cover_image_url ?? null,
      tags: form.tags ?? null, categoria_emocional: form.categoria_emocional ?? null,
    };
    const res = form.id
      ? await supabase.from("resources").update(payload).eq("id", form.id)
      : await supabase.from("resources").insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null); load();
  }

  async function remove(id: string) {
    if (!confirm("¿Borrar este recurso?")) return;
    await supabase.from("resources").delete().eq("id", id);
    load();
  }

  return (
    <>
    <SectionPauseControl section="recursos" />
    <Section
      title="Recursos descargables"
      onNew={() => setEditing({
        type: "Secuencia", published: false, active: false, price: 0,
        sort_order: (items?.length ?? 0) + 1,
      })}
      items={items}
      renderItem={(it) => (
        <ItemRow
          key={it.id}
          title={it.title}
          subtitle={`${it.type}${it.file_path ? " · PDF" : " · sin archivo"} · ${Number(it.price) > 0 ? `${Number(it.price)} €` : "Gratis"}${it.active ? "" : " · desactivado"}`}
          published={it.published}
          onEdit={() => setEditing(it)}
          onDelete={() => remove(it.id)}
        />
      )}
      modal={editing && (
        <EditorModal title={editing.id ? "Editar recurso" : "Nuevo recurso"} onClose={() => setEditing(null)}>
          <ResourceForm initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />
        </EditorModal>
      )}
    />
    </>
  );
}

function ResourceForm({ initial, onSubmit, onCancel }: {
  initial: Partial<ResourceRow>; onSubmit: (v: Partial<ResourceRow>) => void | Promise<void>; onCancel: () => void;
}) {
  const [v, setV] = useState<Partial<ResourceRow>>(initial);
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try { setV({ ...v, file_path: await uploadResourceFile(f) }); }
    catch (err) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setBusy(false); }
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try { setV({ ...v, cover_image_url: await uploadImage(f) }); }
    catch (err) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); await onSubmit(v); setBusy(false); }} className="space-y-4">
      <div><Label>Tipo</Label>
        <select value={v.type ?? "Secuencia"} onChange={(e) => setV({ ...v, type: e.target.value })} className="mt-2 w-full border border-border bg-background/50 px-3 py-2 text-sm text-ink">
          <option>Secuencia</option><option>Plantilla</option><option>Guía</option><option>Ritual</option>
        </select>
      </div>
      <div><Label>Título</Label><TextInput required value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value })} /></div>
      <div><Label>Descripción</Label><TextArea required rows={3} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} /></div>
      <div>
        <Label>Imagen</Label>
        {v.cover_image_url && <img src={v.cover_image_url} alt="" className="mt-2 max-h-40 border border-border" />}
        <input type="file" accept="image/*" onChange={handleImage} className="mt-2 text-xs text-ink/70" />
      </div>
      <div>
        <Label>Archivo PDF</Label>
        {v.file_path && <p className="mt-2 text-xs text-ink/60">Archivo actual: {v.file_path}</p>}
        <input type="file" accept="application/pdf" onChange={handleFile} className="mt-2 text-xs text-ink/70" />
      </div>
      <div>
        <Label>Precio (€)</Label>
        <TextInput
          type="number"
          min="0"
          step="0.01"
          value={v.price ?? 0}
          onChange={(e) => setV({ ...v, price: Number(e.target.value) })}
          placeholder="0 = Gratis"
        />
      </div>
      <div>
        <Label>ID de precio Stripe</Label>
        <TextInput
          value={v.stripe_price_id ?? ""}
          onChange={(e) => setV({ ...v, stripe_price_id: e.target.value })}
          placeholder="price_..."
        />
      </div>
      <div><Label>Etiquetas</Label><TextInput value={v.tags ?? ""} onChange={(e) => setV({ ...v, tags: e.target.value })} placeholder="ej. PDF, Plantilla, Práctica" /></div>
      <EmotionPicker value={v.categoria_emocional} onChange={(categoria_emocional) => setV({ ...v, categoria_emocional })} />
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <Label>Orden</Label>
          <TextInput type="number" value={v.sort_order ?? 0} onChange={(e) => setV({ ...v, sort_order: Number(e.target.value) })} className="!w-24 !mt-0" />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={!!v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} />
          Activado
        </label>
        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" checked={!!v.published} onChange={(e) => setV({ ...v, published: e.target.checked })} />
          Publicado
        </label>
      </div>
      <p className="text-xs text-ink/55">Publicado: se ve en la página. Activado: el botón funciona. Publicado y desactivado: se ve «Próximamente».</p>
      <div className="flex justify-end gap-3 pt-4"><GhostButton type="button" onClick={onCancel}>Cancelar</GhostButton><PrimaryButton type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</PrimaryButton></div>
    </form>
  );
}
