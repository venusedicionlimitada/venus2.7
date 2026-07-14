import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section, ItemRow, EditorModal, Label, TextInput, TextArea, GhostButton, PrimaryButton } from "@/components/admin/AdminUI";
import { ContentForm } from "@/components/ContentForm";
import { uploadImage, slugify } from "@/lib/utils";

type YogaRow = {
  id: string;
  slug: string;
  tarjetas: string;
  date_label: string;
  title: string;
  subtitle: string | null;
  description: string;
  body: string | null;
  cover_image_url: string | null;
  published: boolean;
  sort_order: number;
  tags: string | null;
  categoria_emocional: string | null;
};

export function YogaSection() {
  const [items, setItems] = useState<YogaRow[] | null>(null);
  const [editing, setEditing] = useState<Partial<YogaRow> | null>(null);

  async function load() {
    const { data } = await supabase.from("yoga_articles").select("*").order("sort_order", { ascending: false });
    setItems((data ?? []) as YogaRow[]);
  }
  useEffect(() => { load(); }, []);

  async function save(form: Partial<YogaRow>) {
    const payload = {
      tarjetas: form.tarjetas ?? "Práctica",
      slug: (form.slug && form.slug.trim()) || slugify(form.title ?? ""),
      date_label: form.date_label ?? "",
      title: form.title ?? "",
      subtitle: form.subtitle ?? null,
      description: form.description ?? "",
      body: form.body ?? null,
      cover_image_url: form.cover_image_url ?? null,
      published: form.published ?? false,
      sort_order: form.sort_order ?? 0,
      tags: form.tags ?? null,
      categoria_emocional: form.categoria_emocional ?? null,
    };
    const res = form.id
      ? await supabase.from("yoga_articles").update(payload).eq("id", form.id)
      : await supabase.from("yoga_articles").insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null); load();
  }

  async function remove(id: string) {
    if (!confirm("¿Borrar este artículo de yoga?")) return;
    await supabase.from("yoga_articles").delete().eq("id", id);
    load();
  }

  return (
    <Section
      title="Artículos de Yoga"
      onNew={() => setEditing({ tarjetas: "Práctica", published: false, sort_order: (items?.length ?? 0) + 1 })}
      items={items}
      renderItem={(it) => (
        <ItemRow key={it.id} title={it.title} subtitle={`${it.tarjetas} · ${it.date_label}`} published={it.published}
          onEdit={() => setEditing(it)} onDelete={() => remove(it.id)} />
      )}
      modal={editing && (
        <EditorModal title={editing.id ? "Editar artículo de yoga" : "Nuevo artículo de yoga"} onClose={() => setEditing(null)}>
          <ContentForm 
            initial={editing} 
            onSubmit={save} 
            onCancel={() => setEditing(null)} 
            tarjetaFieldName="tarjetas"
            tarjetaOptions={["Práctica", "Filosofía", "Meditación"]}
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