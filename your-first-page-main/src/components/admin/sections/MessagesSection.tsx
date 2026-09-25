import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GhostButton } from "@/components/admin/AdminUI";

type MessageStatus = "pendiente" | "leido" | "contestado";

type ContactMessage = {
  id: string;
  nombre: string;
  email: string;
  motivo: string;
  mensaje: string;
  status: MessageStatus;
  created_at: string;
};

const STATUS_OPTIONS: { value: MessageStatus; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "leido", label: "Leído" },
  { value: "contestado", label: "Contestado" },
];

export function MessagesSection() {
  const [items, setItems] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error: queryError } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setItems([]);
      return;
    }
    setError(null);
    setItems((data ?? []) as ContactMessage[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: MessageStatus) {
    const previous = items;
    setItems((current) => current?.map((item) => (item.id === id ? { ...item, status } : item)) ?? current);
    const { error: updateError } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (updateError) {
      setItems(previous);
      alert(updateError.message);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Borrar este mensaje?")) return;
    const { error: deleteError } = await supabase.from("contact_messages").delete().eq("id", id);
    if (deleteError) {
      alert(deleteError.message);
      return;
    }
    load();
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Mensajes de contacto</h2>
      <div className="mt-6 space-y-4">
        {items === null && <p className="text-sm text-ink/60">Cargando…</p>}
        {error && <p className="text-sm text-wine">{error}</p>}
        {items?.length === 0 && !error && <p className="text-sm text-ink/60">Todavía no hay mensajes.</p>}
        {items?.map((item) => (
          <article key={item.id} className="border border-border/60 bg-background p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg text-ink">{item.nombre}</p>
                <a href={`mailto:${item.email}`} className="mt-1 inline-block text-sm text-gold underline-offset-4 hover:underline">
                  {item.email}
                </a>
                <p className="mt-2 text-xs uppercase tracking-widest text-ink/55">
                  {item.motivo} · {new Date(item.created_at).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <GhostButton onClick={() => remove(item.id)}>Borrar</GhostButton>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{item.mensaje}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => {
                const active = item.status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(item.id, option.value)}
                    className={`border px-4 py-2 text-[0.7rem] uppercase tracking-[0.25em] transition-colors ${
                      active
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-border text-ink/60 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
