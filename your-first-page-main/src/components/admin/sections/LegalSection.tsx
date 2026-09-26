import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label, TextInput, GhostButton, PrimaryButton } from "@/components/admin/AdminUI";
import { RichTextEditor } from "@/components/RichTextEditor";

type LegalPage = {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  published: boolean;
  active: boolean;
  sort_order: number;
};

const RESERVED = new Set([
  "admin",
  "app",
  "astrologia",
  "auth",
  "contacto",
  "diario",
  "eventos",
  "landing",
  "recursos",
  "servicios",
  "sobre-mi",
  "yoga",
]);

const FOOTER_SLUGS = new Set(["aviso-legal", "privacidad", "cookies"]);

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function LegalSection() {
  const [pages, setPages] = useState<LegalPage[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<LegalPage | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function load(preferId?: string) {
    const { data, error: queryError } = await supabase
      .from("legal_pages")
      .select("id, slug, title, body, published, active, sort_order")
      .order("sort_order");

    if (queryError) {
      setError(queryError.message);
      setPages([]);
      return;
    }

    const rows = (data ?? []) as LegalPage[];
    setPages(rows);
    const nextId = preferId && rows.some((row) => row.id === preferId)
      ? preferId
      : selectedId && rows.some((row) => row.id === selectedId)
        ? selectedId
        : rows[0]?.id ?? null;
    setSelectedId(nextId);
    setForm(rows.find((row) => row.id === nextId) ?? null);
    setError(null);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectPage(id: string) {
    setSelectedId(id);
    setForm(pages?.find((row) => row.id === id) ?? null);
    setSaved(false);
    setError(null);
  }

  async function addPage() {
    const used = new Set((pages ?? []).map((row) => row.slug));
    let n = (pages?.length ?? 0) + 1;
    let slug = `nueva-pagina-${n}`;
    while (used.has(slug)) {
      n += 1;
      slug = `nueva-pagina-${n}`;
    }

    setError(null);
    const { data, error: insertError } = await supabase
      .from("legal_pages")
      .insert({
        title: "Nueva página",
        slug,
        body: "",
        published: false,
        active: false,
        sort_order: n,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }
    await load(data.id);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const slug = toSlug(form.slug);
    const title = form.title.trim();
    if (!title) {
      setError("Escribe un título.");
      return;
    }
    if (!slug) {
      setError("Escribe una dirección.");
      return;
    }
    if (RESERVED.has(slug)) {
      setError("Esa dirección ya la usa otra página de la web.");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError(null);

    const { error: updateError } = await supabase
      .from("legal_pages")
      .update({
        title,
        slug,
        body: form.body || null,
        published: form.published,
        active: form.active,
        sort_order: form.sort_order,
      })
      .eq("id", form.id);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
    await load(form.id);
  }

  async function remove() {
    if (!form) return;
    const footerNote = FOOTER_SLUGS.has(form.slug)
      ? " El enlace del pie seguirá visible y abrirá la página no encontrada."
      : "";
    if (!confirm(`¿Borrar esta página?${footerNote}`)) return;

    const { error: deleteError } = await supabase.from("legal_pages").delete().eq("id", form.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSelectedId(null);
    setForm(null);
    await load();
  }

  if (pages === null) return <p className="text-sm text-ink/60">Cargando…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-2xl text-ink">Páginas</h2>
        <PrimaryButton type="button" onClick={addPage}>Añadir página</PrimaryButton>
      </div>

      <div className="mt-8 max-w-2xl">
        <Label>Página</Label>
        <select
          value={selectedId ?? ""}
          onChange={(e) => selectPage(e.target.value)}
          className="mt-2 w-full border border-border bg-background/50 px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
        >
          {pages.length === 0 && <option value="">Todavía no hay páginas</option>}
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.title}
            </option>
          ))}
        </select>
      </div>

      {form && (
        <form onSubmit={save} className="mt-8 max-w-2xl space-y-5">
          <div>
            <Label>Título</Label>
            <TextInput
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Dirección</Label>
            <TextInput
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="aviso-legal"
            />
            <p className="mt-2 text-xs text-ink/55">
              Se abre en /{toSlug(form.slug) || "…"}. El pie no cambia: sigue enlazando a /aviso-legal, /privacidad y /cookies.
            </p>
          </div>
          <div>
            <Label>Texto</Label>
            <div className="mt-2">
              <RichTextEditor
                key={`${form.id}-${resetToken}`}
                value={form.body ?? ""}
                onChange={(html) => setForm((current) => (current ? { ...current, body: html } : current))}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="w-24">
              <Label>Orden</Label>
              <TextInput
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink/80">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Activada
            </label>
            <label className="flex items-center gap-2 text-sm text-ink/80">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              Publicada
            </label>
          </div>
          <p className="text-xs text-ink/55">
            Publicada y activada: se lee el texto. Publicada y desactivada: «Próximamente». No publicada: página no encontrada.
          </p>

          {error && <p className="text-sm text-wine">{error}</p>}
          {saved && !error && <p className="text-sm text-ink/70">Guardado.</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <GhostButton type="button" onClick={remove}>Borrar</GhostButton>
            <div className="flex gap-3">
              <a
                href={`/${form.slug}`}
                className="border border-border px-4 py-2 text-[0.7rem] uppercase tracking-[0.25em] text-ink/70 hover:border-gold hover:text-gold"
              >
                Ver página
              </a>
              <GhostButton type="button" onClick={() => { setResetToken((token) => token + 1); load(form.id); }}>Descartar</GhostButton>
              <PrimaryButton type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </PrimaryButton>
            </div>
          </div>
        </form>
      )}

      {!form && error && <p className="mt-6 text-sm text-wine">{error}</p>}
    </div>
  );
}
