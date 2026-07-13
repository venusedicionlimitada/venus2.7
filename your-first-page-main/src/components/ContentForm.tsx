import { useState } from "react";
import { RichTextEditor } from "@/components/RichTextEditor";

interface ContentFormProps {
  initial: any;
  onSubmit: (v: any) => void | Promise<void>;
  onCancel: () => void;
  tarjetaFieldName: "tarjeta" | "tarjetas";
  tarjetaOptions: string[];
  Label: any;
  TextInput: any;
  TextArea: any;
  GhostButton: any;
  PrimaryButton: any;
  uploadImage: (f: File) => Promise<string>;
  slugify: (t: string) => string;
}

export function ContentForm({ 
  initial, onSubmit, onCancel, tarjetaFieldName, tarjetaOptions,
  Label, TextInput, TextArea, GhostButton, PrimaryButton, uploadImage, slugify 
}: ContentFormProps) {
  const [v, setV] = useState<any>(initial);
  const [busy, setBusy] = useState(false);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try { 
      setV({ ...v, cover_image_url: await uploadImage(f) }); 
    }
    catch (err) { 
      alert(err instanceof Error ? err.message : "Error subiendo imagen"); 
    }
    finally { setBusy(false); }
  }

  const currentTarjetaValue = v[tarjetaFieldName] || tarjetaOptions[0] || "";

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); await onSubmit(v); setBusy(false); }} className="space-y-4">
      <div>
        <Label>Etiqueta para Tarjeta</Label>
        <select 
          value={currentTarjetaValue} 
          onChange={(e) => setV({ ...v, [tarjetaFieldName]: e.target.value })} 
          className="mt-2 w-full border border-border bg-background/50 px-3 py-2 text-sm text-ink"
        >
          {tarjetaOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      
      <div><Label>Fecha (texto)</Label><TextInput required value={v.date_label ?? ""} onChange={(e) => setV({ ...v, date_label: e.target.value })} placeholder="Mayo 2026" /></div>
      
      <div><Label>Título</Label><TextInput required value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value, slug: v.slug && v.slug.trim() ? v.slug : slugify(e.target.value) })} /></div>
      
      <div><Label>Subtítulo</Label><TextInput value={v.subtitle ?? ""} onChange={(e) => setV({ ...v, subtitle: e.target.value })} placeholder="Escribe el subtítulo aquí..." /></div>
      
      <div><Label>URL (slug)</Label><TextInput value={v.slug ?? ""} onChange={(e) => setV({ ...v, slug: e.target.value })} placeholder="mi-entrada" /><p className="mt-1 text-xs text-ink/50">Se usará en la dirección: /diario/{v.slug || "…"}</p></div>
      
      <div><Label>Extracto</Label><TextArea required rows={2} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} /></div>
      
      <div><Label>Texto completo (opcional)</Label><RichTextEditor value={v.body ?? ""} onChange={(html) => setV({ ...v, body: html })} /></div>
      
      <div><Label>Etiquetas (Manuales)</Label><TextInput value={v.tags ?? ""} onChange={(e) => setV({ ...v, tags: e.target.value })} placeholder="ej. mindfulness, meditacion, conciencia" /></div>
      
      <div><Label>Astrologia Emocional</Label><TextInput value={v.categoria_emocional ?? ""} onChange={(e) => setV({ ...v, categoria_emocional: e.target.value })} placeholder="ej. Integración, Sombra, Claridad" /></div>
      
      <div>
        <Label>Imagen de portada</Label>
        {v.cover_image_url && <img src={v.cover_image_url} alt="" className="mt-2 max-h-40 border border-border" />}
        <input type="file" accept="image/*" onChange={handleImage} className="mt-2 text-xs text-ink/70" />
      </div>
      
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