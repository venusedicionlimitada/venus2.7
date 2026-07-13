import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContentForm } from "@/components/ContentForm";
import { Section, ItemRow, EditorModal, Label, TextInput, TextArea, PrimaryButton, GhostButton } from "@/components/admin/AdminUI";
import { uploadImage, slugify } from "@/lib/utils";

type DiaryRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  date_label: string;
  description: string;
  body: string | null;
  cover_image_url: string | null;
  published: boolean;
  sort_order: number;
  tags: string | null;
  tarjeta: string | null;
  categoria_emocional: string | null;
};

export function DiarySection() {
  const [items, setItems] = useState<DiaryRow[] | null>(null);
  const [editing, setEditing] = useState<Partial<DiaryRow> | null>(null);

  async function load() {
    const { data, error } = await supabase.from("diary_entries").select("*").order("sort_order", { ascending: false });
    if (error) {
      console.error("Error cargando diary_entries:", error);
      return;
    }
    setItems((data ?? []) as DiaryRow[]);
  }
  useEffect(() => { load(); }, []);

  async function save(form: Partial<DiaryRow>) {
    const payload = {
      title: form.title ?? "",
      subtitle: form.subtitle ?? null,
      slug: (form.slug && form.slug.trim()) || slugify(form.title ?? ""),
      date_label: form.date_label ?? "",
      description: form.description ?? "",
      body: form.body ?? null,
      cover_image_url: form.cover_image_url ?? null,
      published: form.published ?? false,
      sort_order: form.sort_order ?? 0,
      tags: form.tags ?? null,
      tarjeta: form.tarjeta ?? "Reflexión",
      categoria_emocional: form.categoria_emocional ?? null,
    };
    const res = form.id
      ? await supabase.from("diary_entries").update(payload).eq("id", form.id)
      : await supabase.from("diary_entries").insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null); load();
  }

  async function remove(id: string) {
    if (!confirm("¿Borrar esta entrada?")) return;
    await supabase.from("diary_entries").delete().eq("id", id);
    load();
  }

  return (
    <Section
      title="Entradas del Diario"
      onNew={() => setEditing({ tarjeta: "Reflexión", published: false, sort_order: (items?.length ?? 0) + 1 })}
      items={items}
      renderItem={(it) => (
        <ItemRow
          key={it.id}
          title={it.title} subtitle={`${it.tarjeta ?? ""} · ${it.date_label}`} published={it.published}
          onEdit={() => setEditing(it)} onDelete={() => remove(it.id)}
        />
      )}
      modal={editing && (
        <EditorModal title={editing.id ? "Editar entrada" : "Nueva entrada"} onClose={() => setEditing(null)}>
          <ContentForm 
            initial={editing} 
            onSubmit={save} 
            onCancel={() => setEditing(null)} 
            tarjetaFieldName="tarjeta"
            tarjetaOptions={["Reflexión", "Proceso", "Integración"]}
            Label={Label}
            TextInput={TextInput}
            TextArea={TextArea}
            GhostButton={GhostButton}
            PrimaryButton={PrimaryButton}
            uploadImage={uploadImage}
            slugify={slugify}
          />
        </EditorModal>
      )}
    />
  );
}