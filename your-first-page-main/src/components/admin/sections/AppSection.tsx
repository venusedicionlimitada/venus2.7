import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/utils";
import { Label, TextInput, TextArea, GhostButton, PrimaryButton } from "@/components/admin/AdminUI";
import { SectionPauseControl } from "@/components/admin/SectionPauseControl";

type PhotoRow = {
  id: string;
  image_url: string;
  alt: string | null;
  sort_order: number;
};

type ReviewRow = {
  id: string;
  quote: string;
  name: string;
  label: string;
  sort_order: number;
};

const EMPTY_REVIEW = { quote: "", name: "", label: "Venusina" };

export function AppSection() {
  const [photos, setPhotos] = useState<PhotoRow[] | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[] | null>(null);
  const [alts, setAlts] = useState<Record<string, string>>({});
  const [newAlt, setNewAlt] = useState("");
  const [reviewForm, setReviewForm] = useState<Partial<ReviewRow> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [photoRes, reviewRes] = await Promise.all([
      supabase.from("app_photos").select("*").order("sort_order", { ascending: true }),
      supabase.from("app_reviews").select("*").order("sort_order", { ascending: true }),
    ]);

    if (photoRes.error || reviewRes.error) {
      setError(photoRes.error?.message ?? reviewRes.error?.message ?? "No se pudo cargar");
      setPhotos([]);
      setReviews([]);
      return;
    }

    const rows = (photoRes.data ?? []) as PhotoRow[];
    setPhotos(rows);
    setAlts(Object.fromEntries(rows.map((row) => [row.id, row.alt ?? ""])));
    setReviews((reviewRes.data ?? []) as ReviewRow[]);
    setError(null);
  }

  useEffect(() => {
    load();
  }, []);

  async function addPhoto(file: File) {
    setBusy("new-photo");
    setError(null);
    try {
      const image_url = await uploadImage(file);
      const { error: insertError } = await supabase.from("app_photos").insert({
        image_url,
        alt: newAlt.trim() || null,
        sort_order: (photos?.length ?? 0) + 1,
      });
      if (insertError) setError(insertError.message);
      else {
        setNewAlt("");
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la captura");
    }
    setBusy(null);
  }

  async function removePhoto(id: string) {
    if (!confirm("¿Quitar esta captura del marco?")) return;
    setBusy(id);
    const { error: deleteError } = await supabase.from("app_photos").delete().eq("id", id);
    setBusy(null);
    if (deleteError) setError(deleteError.message);
    else await load();
  }

  async function movePhoto(index: number, direction: -1 | 1) {
    if (!photos) return;
    const next = index + direction;
    if (next < 0 || next >= photos.length) return;
    const current = photos[index];
    const other = photos[next];
    setBusy("photo-order");
    const first = await supabase.from("app_photos").update({ sort_order: other.sort_order }).eq("id", current.id);
    const second = await supabase.from("app_photos").update({ sort_order: current.sort_order }).eq("id", other.id);
    setBusy(null);
    if (first.error || second.error) setError(first.error?.message ?? second.error?.message ?? "No se pudo reordenar");
    else await load();
  }

  async function saveAlt(id: string) {
    setBusy(id);
    const { error: updateError } = await supabase.from("app_photos").update({ alt: alts[id]?.trim() || null }).eq("id", id);
    setBusy(null);
    if (updateError) setError(updateError.message);
    else await load();
  }

  async function saveReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm) return;
    setBusy("review");
    const payload = {
      quote: reviewForm.quote?.trim() ?? "",
      name: reviewForm.name?.trim() ?? "",
      label: reviewForm.label?.trim() || "Venusina",
      sort_order: reviewForm.sort_order ?? (reviews?.length ?? 0) + 1,
    };
    const res = reviewForm.id
      ? await supabase.from("app_reviews").update(payload).eq("id", reviewForm.id)
      : await supabase.from("app_reviews").insert(payload);
    setBusy(null);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setReviewForm(null);
    await load();
  }

  async function removeReview(id: string) {
    if (!confirm("¿Borrar esta reseña?")) return;
    const { error: deleteError } = await supabase.from("app_reviews").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    else await load();
  }

  async function moveReview(index: number, direction: -1 | 1) {
    if (!reviews) return;
    const next = index + direction;
    if (next < 0 || next >= reviews.length) return;
    const current = reviews[index];
    const other = reviews[next];
    setBusy("order");
    const first = await supabase.from("app_reviews").update({ sort_order: other.sort_order }).eq("id", current.id);
    const second = await supabase.from("app_reviews").update({ sort_order: current.sort_order }).eq("id", other.id);
    setBusy(null);
    if (first.error || second.error) setError(first.error?.message ?? second.error?.message ?? "No se pudo reordenar");
    else await load();
  }

  return (
    <div>
      <SectionPauseControl section="app" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">Venus App</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
            El marco de «Así responde Venus» enseña primero las tres capturas de la página. Las que añadas aquí salen detrás, en el orden que les dejes. Las fotos de cabecera no se cambian desde aquí.
          </p>
        </div>
        <Link to="/app" className="text-[0.7rem] uppercase tracking-[0.25em] text-ink/60 hover:text-gold">
          Ver página →
        </Link>
      </div>

      {error && <p className="mt-6 text-sm text-wine">{error}</p>}

      <h3 className="mt-10 font-display text-xl text-ink">Capturas</h3>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[14rem] flex-1">
          <Label>Texto alternativo de la nueva</Label>
          <TextInput value={newAlt} onChange={(e) => setNewAlt(e.target.value)} placeholder="Qué se ve en la captura" />
        </div>
        <label className="cursor-pointer border border-gold bg-gold/10 px-5 py-2.5 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground">
          {busy === "new-photo" ? "Subiendo…" : "+ Añadir captura"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy === "new-photo"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) addPhoto(file);
            }}
          />
        </label>
      </div>
      <div className="mt-4 space-y-px bg-border/40">
        {photos === null && <p className="bg-background p-6 text-sm text-ink/60">Cargando…</p>}
        {photos?.length === 0 && (
          <p className="bg-background p-6 text-sm text-ink/60">Todavía no hay capturas añadidas. El marco sigue con las tres de la página.</p>
        )}
        {photos?.map((row, index) => (
          <div key={row.id} className="flex flex-wrap items-center gap-4 bg-background p-5">
            <div className="h-16 w-16 shrink-0 overflow-hidden border border-border bg-ink/5">
              <img src={row.image_url} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-ink/55">Captura {index + 4}</p>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="min-w-[12rem] flex-1">
                  <Label>Texto alternativo</Label>
                  <TextInput
                    value={alts[row.id] ?? ""}
                    onChange={(e) => setAlts({ ...alts, [row.id]: e.target.value })}
                  />
                </div>
                <GhostButton type="button" disabled={busy === row.id} onClick={() => saveAlt(row.id)}>
                  Guardar texto
                </GhostButton>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <GhostButton type="button" disabled={busy === "photo-order" || index === 0} onClick={() => movePhoto(index, -1)}>
                Subir
              </GhostButton>
              <GhostButton
                type="button"
                disabled={busy === "photo-order" || index === (photos?.length ?? 0) - 1}
                onClick={() => movePhoto(index, 1)}
              >
                Bajar
              </GhostButton>
              <GhostButton type="button" disabled={busy === row.id} onClick={() => removePhoto(row.id)}>
                Quitar
              </GhostButton>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between">
        <h3 className="font-display text-xl text-ink">Reseñas</h3>
        <PrimaryButton type="button" onClick={() => setReviewForm({ ...EMPTY_REVIEW })}>
          + Nueva
        </PrimaryButton>
      </div>
      <div className="mt-4 space-y-px bg-border/40">
        {reviews === null && <p className="bg-background p-6 text-sm text-ink/60">Cargando…</p>}
        {reviews?.length === 0 && <p className="bg-background p-6 text-sm text-ink/60">Ninguna reseña todavía.</p>}
        {reviews?.map((review, index) => (
          <div key={review.id} className="flex items-center justify-between gap-4 bg-background p-5">
            <div className="min-w-0">
              <p className="truncate font-display text-lg text-ink">{review.name}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-ink/70">{review.quote}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <GhostButton type="button" disabled={busy === "order" || index === 0} onClick={() => moveReview(index, -1)}>
                Subir
              </GhostButton>
              <GhostButton
                type="button"
                disabled={busy === "order" || index === reviews.length - 1}
                onClick={() => moveReview(index, 1)}
              >
                Bajar
              </GhostButton>
              <GhostButton type="button" onClick={() => setReviewForm(review)}>
                Editar
              </GhostButton>
              <GhostButton type="button" onClick={() => removeReview(review.id)}>
                Borrar
              </GhostButton>
            </div>
          </div>
        ))}
      </div>

      {reviewForm && (
        <form onSubmit={saveReview} className="mt-6 max-w-2xl space-y-5 border border-border p-5">
          <h4 className="font-display text-lg text-ink">{reviewForm.id ? "Editar reseña" : "Nueva reseña"}</h4>
          <div>
            <Label>Texto</Label>
            <TextArea
              required
              rows={3}
              value={reviewForm.quote ?? ""}
              onChange={(e) => setReviewForm({ ...reviewForm, quote: e.target.value })}
            />
          </div>
          <div>
            <Label>Nombre</Label>
            <TextInput
              required
              value={reviewForm.name ?? ""}
              onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Etiqueta</Label>
            <TextInput
              value={reviewForm.label ?? ""}
              onChange={(e) => setReviewForm({ ...reviewForm, label: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <PrimaryButton type="submit" disabled={busy === "review"}>
              {busy === "review" ? "Guardando…" : "Guardar"}
            </PrimaryButton>
            <GhostButton type="button" onClick={() => setReviewForm(null)}>
              Cancelar
            </GhostButton>
          </div>
        </form>
      )}
    </div>
  );
}
