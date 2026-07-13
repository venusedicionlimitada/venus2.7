import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { RichTextEditor } from "@/components/RichTextEditor";

function slugify(v: string): string {
  return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "") || "entrada";
}

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel · Venus" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Tab = "diario" | "astrologia" | "recursos" | "servicios" | "eventos" | "yoga";

function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useAuth();
  const [tab, setTab] = useState<Tab>("diario");

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/", replace: true });
  }, [loading, isAdmin, navigate]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (loading) return <div className="mx-auto max-w-5xl px-6 py-24 text-center text-ink/60">Cargando…</div>;
  if (!isAdmin) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <p className="eyebrow text-gold">Panel privado</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Tu contenido</h1>
          <p className="mt-1 text-xs text-ink/50">{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[0.7rem] uppercase tracking-[0.25em] text-ink/60 hover:text-gold">Ver web →</Link>
          <button onClick={handleSignOut} className="border border-border px-4 py-2 text-[0.7rem] uppercase tracking-[0.25em] text-ink/70 hover:border-gold hover:text-gold">
            Salir
          </button>
        </div>
      </header>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-border/40">
        {(["diario", "astrologia", "yoga", "recursos", "servicios", "eventos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-xs uppercase tracking-[0.25em] transition-colors ${
              tab === t ? "border-b-2 border-gold text-gold" : "text-ink/60 hover:text-ink"
            }`}
          >
            {t === "diario" ? "Diario" : t === "astrologia" ? "Astrología" : t === "yoga" ? "Yoga" : t === "recursos" ? "Recursos" : t === "servicios" ? "Terapias" : t === "eventos" ? "Eventos" : ""}
          </button>
        ))}
      </nav>

      <div className="mt-10">
        {tab === "diario" && <DiarySection />}
        {tab === "astrologia" && <AstrologySection />}
        {tab === "yoga" && <YogaSection />}
        {tab === "recursos" && <ResourcesSection />}
        {tab === "servicios" && <ServicesSection />}
        {tab === "eventos" && <EventsSection />}
      </div>
    </div>
  );
}

/* ---------- Shared form primitives ---------- */

function Label({ children }: { children: ReactNode }) {
  return <label className="eyebrow block text-ink/70">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="mt-2 w-full border border-border bg-background/50 px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none" />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="mt-2 w-full resize-y border border-border bg-background/50 px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none" />;
}

function PrimaryButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className="border border-gold bg-gold/10 px-5 py-2.5 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors disabled:opacity-50">
      {children}
    </button>
  );
}

function GhostButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className="border border-border px-4 py-2 text-[0.7rem] uppercase tracking-[0.25em] text-ink/70 hover:border-gold hover:text-gold">
      {children}
    </button>
  );
}

/* ---------- Image upload helper ---------- */

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("content-images").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage.from("content-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (error || !data) throw error ?? new Error("No se pudo generar la URL");
  return data.signedUrl;
}

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

/* ---------- Diario ---------- */

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

function DiarySection() {
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
          <DiaryForm initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />
        </EditorModal>
      )}
    />
  );
}

function DiaryForm({ initial, onSubmit, onCancel }: {
  initial: Partial<DiaryRow>; onSubmit: (v: Partial<DiaryRow>) => void | Promise<void>; onCancel: () => void;
}) {
  const [v, setV] = useState<Partial<DiaryRow>>(initial);
  const [busy, setBusy] = useState(false);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true);
    try { setV({ ...v, cover_image_url: await uploadImage(f) }); }
    catch (err) { alert(err instanceof Error ? err.message : "Error subiendo imagen"); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); await onSubmit(v); setBusy(false); }} className="space-y-4">
      <div><Label>Etiqueta para Tarjeta</Label>
        <select value={v.tarjeta ?? "Reflexión"} onChange={(e) => setV({ ...v, tarjeta: e.target.value })} className="mt-2 w-full border border-border bg-background/50 px-3 py-2 text-sm text-ink">
          <option>Reflexión</option><option>Proceso</option><option>Integración</option>
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

/* ---------- Astrología ---------- */

type AstroRow = {
  id: string;
  slug: string;
  tarjetas: string;
  date_label: string;
  title: string;
  description: string;
  body: string | null;
  cover_image_url: string | null;
  published: boolean;
  sort_order: number;
  tags: string | null;
  categoria_emocional: string | null;
};

function AstrologySection() {
  const [items, setItems] = useState<AstroRow[] | null>(null);
  const [editing, setEditing] = useState<Partial<AstroRow> | null>(null);

  async function load() {
    const { data } = await supabase.from("astrology_articles").select("*").order("sort_order", { ascending: false });
    setItems((data ?? []) as AstroRow[]);
  }
  useEffect(() => { load(); }, []);

  async function save(form: Partial<AstroRow>) {
    const payload = {
      tarjetas: form.tarjetas ?? "Lunación",
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
      ? await supabase.from("astrology_articles").update(payload).eq("id", form.id)
      : await supabase.from("astrology_articles").insert(payload);
    if (res.error) { alert(res.error.message); return; }
    setEditing(null); load();
  }

  async function remove(id: string) {
    if (!confirm("¿Borrar este artículo?")) return;
    await supabase.from("astrology_articles").delete().eq("id", id);
    load();
  }

  return (
    <Section
      title="Artículos de Astrología"
      onNew={() => setEditing({ tarjetas: "Lunación", published: false, sort_order: (items?.length ?? 0) + 1 })}
      items={items}
      renderItem={(it) => (
        <ItemRow key={it.id} title={it.title} subtitle={`${it.tarjetas} · ${it.date_label}`} published={it.published}
          onEdit={() => setEditing(it)} onDelete={() => remove(it.id)} />
      )}
      modal={editing && (
        <EditorModal title={editing.id ? "Editar artículo" : "Nuevo artículo"} onClose={() => setEditing(null)}>
          <AstroForm initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />
        </EditorModal>
      )}
    />
  );
}

function AstroForm({ initial, onSubmit, onCancel }: {
  initial: Partial<AstroRow>; onSubmit: (v: Partial<AstroRow>) => void | Promise<void>; onCancel: () => void;
}) {
  const [v, setV] = useState<Partial<AstroRow>>(initial);
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
      <div><Label>Etiqueta para Tarjeta</Label>
        <select value={v.tarjetas ?? "Lunación"} onChange={(e) => setV({ ...v, tarjetas: e.target.value })} className="mt-2 w-full border border-border bg-background/50 px-3 py-2 text-sm text-ink">
          <option>Lunación</option><option>Tránsito</option><option>Configuración</option>
        </select>
      </div>
      <div><Label>Fecha (texto)</Label><TextInput required value={v.date_label ?? ""} onChange={(e) => setV({ ...v, date_label: e.target.value })} placeholder="10 Jun 2026" /></div>
      <div><Label>Título</Label><TextInput required value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value, slug: v.slug && v.slug.trim() ? v.slug : slugify(e.target.value) })} /></div>
      <div><Label>Subtítulo</Label><TextInput value={v.subtitle ?? ""} onChange={(e) => setV({ ...v, subtitle: e.target.value })} placeholder="Escribe el subtítulo aquí..." /></div>
      <div><Label>URL (slug)</Label><TextInput value={v.slug ?? ""} onChange={(e) => setV({ ...v, slug: e.target.value })} placeholder="mi-articulo" /><p className="mt-1 text-xs text-ink/50">Se usará en la dirección: /astrologia/{v.slug || "…"}</p></div>
      <div><Label>Extracto</Label><TextArea required rows={2} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} /></div>
      <div><Label>Texto completo (opcional)</Label><RichTextEditor value={v.body ?? ""} onChange={(html) => setV({ ...v, body: html })} /></div>
      <div><Label>Etiquetas</Label><TextInput value={v.tags ?? ""} onChange={(e) => setV({ ...v, tags: e.target.value })} placeholder="ej. Plutón, Tránsito, Sanación" /></div>
      <div><Label>Astrologia Emocional</Label><TextInput value={v.categoria_emocional ?? ""} onChange={(e) => setV({ ...v, categoria_emocional: e.target.value })} placeholder="ej. Integración, Sombra, Claridad" /></div>
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

/* ---------- Yoga ---------- */

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

function YogaSection() {
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
          <YogaForm initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />
        </EditorModal>
      )}
    />
  );
}

function YogaForm({ initial, onSubmit, onCancel }: {
  initial: Partial<YogaRow>; onSubmit: (v: Partial<YogaRow>) => void | Promise<void>; onCancel: () => void;
}) {
  const [v, setV] = useState<Partial<YogaRow>>(initial);
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
      <div><Label>Etiqueta Tarjeta</Label>
        <select value={v.tarjetas ?? "Práctica"} onChange={(e) => setV({ ...v, tarjetas: e.target.value })} className="mt-2 w-full border border-border bg-background/50 px-3 py-2 text-sm text-ink">
          <option>Práctica</option><option>Filosofía</option><option>Meditación</option>
        </select>
      </div>
      <div><Label>Fecha (texto)</Label><TextInput required value={v.date_label ?? ""} onChange={(e) => setV({ ...v, date_label: e.target.value })} placeholder="Mayo 2026" /></div>
      <div><Label>Título</Label><TextInput required value={v.title ?? ""} onChange={(e) => setV({ ...v, title: e.target.value, slug: v.slug && v.slug.trim() ? v.slug : slugify(e.target.value) })} /></div>
      <div><Label>Subtítulo</Label><TextInput value={v.subtitle ?? ""} onChange={(e) => setV({ ...v, subtitle: e.target.value })} placeholder="Escribe el subtítulo aquí..." /></div>
      <div><Label>URL (slug)</Label><TextInput value={v.slug ?? ""} onChange={(e) => setV({ ...v, slug: e.target.value })} placeholder="mi-practica" /><p className="mt-1 text-xs text-ink/50">Se usará en la dirección: /yoga/{v.slug || "…"}</p></div>
      <div><Label>Extracto</Label><TextArea required rows={2} value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} /></div>
      <div><Label>Texto completo (opcional)</Label><RichTextEditor value={v.body ?? ""} onChange={(html) => setV({ ...v, body: html })} /></div>
      <div><Label>Etiquetas</Label><TextInput value={v.tags ?? ""} onChange={(e) => setV({ ...v, tags: e.target.value })} placeholder="ej. Asanas, Nidra, Respiración" /></div>
      <div><Label>Astrología Emocional</Label><TextInput value={v.categoria_emocional ?? ""} onChange={(e) => setV({ ...v, categoria_emocional: e.target.value })} placeholder="ej. Calma, Enfoque, Claridad" /></div>
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

/* ---------- Recursos ---------- */

type ResourceRow = {
  id: string; type: string; title: string; description: string;
  file_path: string | null; published: boolean; sort_order: number;
  tags: string | null; categoria_emocional: string | null;
};

function ResourcesSection() {
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
      file_path: form.file_path ?? null, published: form.published ?? false, sort_order: form.sort_order ?? 0,
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
    <Section
      title="Recursos descargables"
      onNew={() => setEditing({ type: "Secuencia", published: false, sort_order: (items?.length ?? 0) + 1 })}
      items={items}
      renderItem={(it) => (
        <ItemRow key={it.id} title={it.title} subtitle={`${it.type}${it.file_path ? " · PDF" : " · sin archivo"}`} published={it.published}
          onEdit={() => setEditing(it)} onDelete={() => remove(it.id)} />
      )}
      modal={editing && (
        <EditorModal title={editing.id ? "Editar recurso" : "Nuevo recurso"} onClose={() => setEditing(null)}>
          <ResourceForm initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />
        </EditorModal>
      )}
    />
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
        <Label>Archivo PDF</Label>
        {v.file_path && <p className="mt-2 text-xs text-ink/60">Archivo actual: {v.file_path}</p>}
        <input type="file" accept="application/pdf" onChange={handleFile} className="mt-2 text-xs text-ink/70" />
      </div>
      <div><Label>Etiquetas</Label><TextInput value={v.tags ?? ""} onChange={(e) => setV({ ...v, tags: e.target.value })} placeholder="ej. PDF, Plantilla, Práctica" /></div>
      <div><Label>Categoría Emocional</Label><TextInput value={v.categoria_emocional ?? ""} onChange={(e) => setV({ ...v, categoria_emocional: e.target.value })} placeholder="ej. Enfoque, Claridad, Estructura" /></div>
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

/* ---------- Servicios ---------- */

type ServiceRow = {
  id: string; num: string; title: string; duration: string; body: string;
  published: boolean; sort_order: number;
  tags: string | null; categoria_emocional: string | null;
};

function ServicesSection() {
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

/* ---------- Eventos ---------- */

type EventRow = {
  id: string; titulo: string; subtitulo: string; description: string; 
  cover_image_url: string | null; fecha_evento: string; hora_evento: string;
  published: boolean; related_article_ids: string[]; sort_order: number;
  tags: string | null; categoria_emocional: string | null;
};

function EventsSection() {
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

/* ---------- Generic Section + Modal ---------- */

function Section<T>({ title, items, renderItem, onNew, modal }: {
  title: string; items: T[] | null; renderItem: (it: T) => ReactNode; onNew: () => void; modal: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        <PrimaryButton onClick={onNew}>+ Nuevo</PrimaryButton>
      </div>
      <div className="mt-6 space-y-px bg-border/40">
        {items === null && <p className="bg-background p-6 text-sm text-ink/60">Cargando…</p>}
        {items?.length === 0 && <p className="bg-background p-6 text-sm text-ink/60">Nada por ahora. Pulsa "Nuevo".</p>}
        {items?.map(renderItem)}
      </div>
      {modal}
    </div>
  );
}

function ItemRow({ title, subtitle, published, onEdit, onDelete }: {
  title: string; subtitle: string; published: boolean; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-background p-5">
      <div className="min-w-0">
        <p className="truncate font-display text-lg text-ink">{title}</p>
        <p className="mt-0.5 text-xs uppercase tracking-widest text-ink/55">{subtitle} · {published ? <span className="text-gold">Publicado</span> : <span>Borrador</span>}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <GhostButton onClick={onEdit}>Editar</GhostButton>
        <GhostButton onClick={onDelete}>Borrar</GhostButton>
      </div>
    </div>
  );
}

function EditorModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/85 p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl border border-gold/40 bg-card p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-ink/60 hover:text-gold" aria-label="Cerrar">✕</button>
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}