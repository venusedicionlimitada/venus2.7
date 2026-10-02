import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/utils";
import { Label, TextInput, TextArea, GhostButton, PrimaryButton } from "@/components/admin/AdminUI";
import { SectionPauseControl } from "@/components/admin/SectionPauseControl";

type PhotoSlot = "responde" | "carta" | "galeria";

type PhotoRow = {
  id: string;
  image_url: string;
  alt: string | null;
  sort_order: number;
  slot: string;
};

type ReviewRow = {
  id: string;
  quote: string;
  name: string;
  label: string;
  sort_order: number;
};

type StepRow = {
  id: string;
  marker: string;
  title: string;
  body: string;
  sort_order: number;
};

const EMPTY_REVIEW = { quote: "", name: "", label: "Venusina" };

function CaptureList({
  title,
  empty,
  photos,
  indexOffset,
  alts,
  onAlt,
  newAlt,
  onNewAlt,
  busy,
  uploading,
  onAdd,
  onSaveAlt,
  onMove,
  onRemove,
}: {
  title: string;
  empty: string;
  photos: PhotoRow[] | undefined;
  indexOffset: number;
  alts: Record<string, string>;
  onAlt: (id: string, value: string) => void;
  newAlt: string;
  onNewAlt: (value: string) => void;
  busy: string | null;
  uploading: boolean;
  onAdd: (file: File) => void;
  onSaveAlt: (id: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mt-10 font-display text-xl text-ink">{title}</h3>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[14rem] flex-1">
          <Label>Texto alternativo de la nueva</Label>
          <TextInput value={newAlt} onChange={(e) => onNewAlt(e.target.value)} placeholder="Qué se ve en la captura" />
        </div>
        <label className="cursor-pointer border border-gold bg-gold/10 px-5 py-2.5 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground">
          {uploading ? "Subiendo…" : "+ Añadir captura"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onAdd(file);
            }}
          />
        </label>
      </div>
      <div className="mt-4 space-y-px bg-border/40">
        {photos === undefined && <p className="bg-background p-6 text-sm text-ink/60">Cargando…</p>}
        {photos?.length === 0 && <p className="bg-background p-6 text-sm text-ink/60">{empty}</p>}
        {photos?.map((row, index) => (
          <div key={row.id} className="flex flex-wrap items-center gap-4 bg-background p-5">
            <div className="h-16 w-16 shrink-0 overflow-hidden border border-border bg-ink/5">
              <img src={row.image_url} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-widest text-ink/55">Captura {index + indexOffset}</p>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="min-w-[12rem] flex-1">
                  <Label>Texto alternativo</Label>
                  <TextInput value={alts[row.id] ?? ""} onChange={(e) => onAlt(row.id, e.target.value)} />
                </div>
                <GhostButton type="button" disabled={busy === row.id} onClick={() => onSaveAlt(row.id)}>
                  Guardar texto
                </GhostButton>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <GhostButton type="button" disabled={busy === "photo-order" || index === 0} onClick={() => onMove(index, -1)}>
                Subir
              </GhostButton>
              <GhostButton
                type="button"
                disabled={busy === "photo-order" || index === photos.length - 1}
                onClick={() => onMove(index, 1)}
              >
                Bajar
              </GhostButton>
              <GhostButton type="button" disabled={busy === row.id} onClick={() => onRemove(row.id)}>
                Quitar
              </GhostButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppSection() {
  const [photos, setPhotos] = useState<PhotoRow[] | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[] | null>(null);
  const [alts, setAlts] = useState<Record<string, string>>({});
  const [newAlt, setNewAlt] = useState("");
  const [newCartaAlt, setNewCartaAlt] = useState("");
  const [newGalleryAlt, setNewGalleryAlt] = useState("");
  const [steps, setSteps] = useState<StepRow[] | null>(null);
  const [stepForm, setStepForm] = useState<Partial<StepRow> | null>(null);
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

    const rows = ((photoRes.data ?? []) as PhotoRow[]).map((row) => ({
      ...row,
      slot: row.slot === "carta" || row.slot === "galeria" ? row.slot : "responde",
    }));
    setPhotos(rows);
    setAlts(Object.fromEntries(rows.map((row) => [row.id, row.alt ?? ""])));
    setReviews((reviewRes.data ?? []) as ReviewRow[]);

    const stepRes = await supabase.from("app_steps").select("*").order("sort_order", { ascending: true });
    if (stepRes.error) {
      setSteps([]);
      setError(stepRes.error.message);
      return;
    }
    setSteps((stepRes.data ?? []) as StepRow[]);
    setError(null);
  }

  useEffect(() => {
    load();
  }, []);

  async function addPhoto(file: File, slot: PhotoSlot) {
    setBusy(`new-${slot}`);
    setError(null);
    const alt = slot === "carta" ? newCartaAlt : slot === "galeria" ? newGalleryAlt : newAlt;
    const list = (photos ?? []).filter((row) => row.slot === slot);
    try {
      const image_url = await uploadImage(file);
      const { error: insertError } = await supabase.from("app_photos").insert({
        image_url,
        alt: alt.trim() || null,
        sort_order: list.reduce((max, row) => Math.max(max, row.sort_order), 0) + 1,
        slot,
      });
      if (insertError) setError(insertError.message);
      else {
        if (slot === "carta") setNewCartaAlt("");
        else if (slot === "galeria") setNewGalleryAlt("");
        else setNewAlt("");
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

  async function movePhoto(list: PhotoRow[], index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= list.length) return;
    const current = list[index];
    const other = list[next];
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

  async function saveStep(e: React.FormEvent) {
    e.preventDefault();
    if (!stepForm) return;
    setBusy("step");
    const payload = {
      marker: stepForm.marker?.trim() ?? "",
      title: stepForm.title?.trim() ?? "",
      body: stepForm.body?.trim() ?? "",
      sort_order: stepForm.sort_order ?? (steps?.length ?? 0) + 1,
    };
    const res = stepForm.id
      ? await supabase.from("app_steps").update(payload).eq("id", stepForm.id)
      : await supabase.from("app_steps").insert(payload);
    setBusy(null);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    setStepForm(null);
    await load();
  }

  async function removeStep(id: string) {
    if (!confirm("¿Borrar este paso?")) return;
    const { error: deleteError } = await supabase.from("app_steps").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    else await load();
  }

  async function moveStep(index: number, direction: -1 | 1) {
    if (!steps) return;
    const next = index + direction;
    if (next < 0 || next >= steps.length) return;
    const current = steps[index];
    const other = steps[next];
    setBusy("step-order");
    const first = await supabase.from("app_steps").update({ sort_order: other.sort_order }).eq("id", current.id);
    const second = await supabase.from("app_steps").update({ sort_order: current.sort_order }).eq("id", other.id);
    setBusy(null);
    if (first.error || second.error) setError(first.error?.message ?? second.error?.message ?? "No se pudo reordenar");
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
            «Así responde Venus» ya no tiene marco: lo que subas en ese hueco no se ve. «Tu carta, o la de dos» tiene el suyo. La galería ya muestra la portada, la carta, los informes, los tránsitos y dos sinastrías. Las fotos que subas se añaden al final.
          </p>
        </div>
        <Link to="/app" className="text-[0.7rem] uppercase tracking-[0.25em] text-ink/60 hover:text-gold">
          Ver página →
        </Link>
      </div>

      {error && <p className="mt-6 text-sm text-wine">{error}</p>}

      <CaptureList
        title="Capturas de «Así responde Venus»"
        empty="Este hueco ya no se muestra en la página. Sube las fotos en la galería o en el bloque de las dos cartas."
        photos={photos?.filter((row) => row.slot === "responde")}
        indexOffset={3}
        alts={alts}
        onAlt={(id, value) => setAlts({ ...alts, [id]: value })}
        newAlt={newAlt}
        onNewAlt={setNewAlt}
        busy={busy}
        uploading={busy === "new-responde"}
        onAdd={(file) => addPhoto(file, "responde")}
        onSaveAlt={saveAlt}
        onMove={(index, direction) => movePhoto(photos?.filter((row) => row.slot === "responde") ?? [], index, direction)}
        onRemove={removePhoto}
      />
      <CaptureList
        title="Capturas de «Tu carta, o la de dos»"
        empty="El marco ya muestra las capturas de las dos cartas. Las que subas aquí se añaden al final."
        photos={photos?.filter((row) => row.slot === "carta")}
        indexOffset={17}
        alts={alts}
        onAlt={(id, value) => setAlts({ ...alts, [id]: value })}
        newAlt={newCartaAlt}
        onNewAlt={setNewCartaAlt}
        busy={busy}
        uploading={busy === "new-carta"}
        onAdd={(file) => addPhoto(file, "carta")}
        onSaveAlt={saveAlt}
        onMove={(index, direction) => movePhoto(photos?.filter((row) => row.slot === "carta") ?? [], index, direction)}
        onRemove={removePhoto}
      />
      <CaptureList
        title="Fotos de la galería"
        empty="La galería ya muestra las capturas del código. Las que subas aquí se añaden al final."
        photos={photos?.filter((row) => row.slot === "galeria")}
        indexOffset={26}
        alts={alts}
        onAlt={(id, value) => setAlts({ ...alts, [id]: value })}
        newAlt={newGalleryAlt}
        onNewAlt={setNewGalleryAlt}
        busy={busy}
        uploading={busy === "new-galeria"}
        onAdd={(file) => addPhoto(file, "galeria")}
        onSaveAlt={saveAlt}
        onMove={(index, direction) => movePhoto(photos?.filter((row) => row.slot === "galeria") ?? [], index, direction)}
        onRemove={removePhoto}
      />

      <div className="mt-12 flex items-center justify-between">
        <h3 className="font-display text-xl text-ink">Pasos</h3>
        <PrimaryButton type="button" onClick={() => setStepForm({ marker: "", title: "", body: "" })}>
          + Nuevo
        </PrimaryButton>
      </div>
      <div className="mt-4 space-y-px bg-border/40">
        {steps === null && <p className="bg-background p-6 text-sm text-ink/60">Cargando…</p>}
        {steps?.length === 0 && <p className="bg-background p-6 text-sm text-ink/60">Ningún paso todavía.</p>}
        {steps?.map((step, index) => (
          <div key={step.id} className="flex items-center justify-between gap-4 bg-background p-5">
            <div className="min-w-0">
              <p className="truncate font-display text-lg text-ink">
                {step.marker} {step.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm text-ink/70">{step.body}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <GhostButton type="button" disabled={busy === "step-order" || index === 0} onClick={() => moveStep(index, -1)}>
                Subir
              </GhostButton>
              <GhostButton
                type="button"
                disabled={busy === "step-order" || index === steps.length - 1}
                onClick={() => moveStep(index, 1)}
              >
                Bajar
              </GhostButton>
              <GhostButton type="button" onClick={() => setStepForm(step)}>
                Editar
              </GhostButton>
              <GhostButton type="button" onClick={() => removeStep(step.id)}>
                Borrar
              </GhostButton>
            </div>
          </div>
        ))}
      </div>

      {stepForm && (
        <form onSubmit={saveStep} className="mt-6 max-w-2xl space-y-5 border border-border p-5">
          <h4 className="font-display text-lg text-ink">{stepForm.id ? "Editar paso" : "Nuevo paso"}</h4>
          <div>
            <Label>Número</Label>
            <TextInput
              required
              value={stepForm.marker ?? ""}
              onChange={(e) => setStepForm({ ...stepForm, marker: e.target.value })}
              placeholder="01"
            />
          </div>
          <div>
            <Label>Título</Label>
            <TextInput
              required
              value={stepForm.title ?? ""}
              onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Texto</Label>
            <TextArea
              required
              rows={3}
              value={stepForm.body ?? ""}
              onChange={(e) => setStepForm({ ...stepForm, body: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <PrimaryButton type="submit" disabled={busy === "step"}>
              {busy === "step" ? "Guardando…" : "Guardar"}
            </PrimaryButton>
            <GhostButton type="button" onClick={() => setStepForm(null)}>
              Cancelar
            </GhostButton>
          </div>
        </form>
      )}

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
