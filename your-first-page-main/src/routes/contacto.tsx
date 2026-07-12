import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "../components/SiteHeader";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto · Venus Edición Limitada" },
      { name: "description", content: "Escríbeme para reservar una sesión, una lectura de carta o resolver tus dudas." },
      { property: "og:title", content: "Contacto · Venus" },
      { property: "og:description", content: "Escríbeme para reservar una sesión o resolver dudas." },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const [sent, setSent] = useState(false);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Pendiente: conectar con Lovable Cloud para guardar y notificar.
    setSent(true);
  }

return (
    <>
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
        <header className="text-center">
          <p className="eyebrow text-gold">Contacto</p>
          <h1 className="mt-6 font-display text-5xl text-ink md:text-7xl">
            Conversemos.
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ink/75">
            Cuéntame qué te trae aquí: una sesión, una lectura, una duda. Leo
            cada mensaje personalmente y te respondo en pocos días.
          </p>
        </header>

        {sent ? (
          <div className="mt-20 border border-gold/40 bg-card p-12 text-center">
            <p className="eyebrow text-gold">Mensaje recibido</p>
            <h2 className="mt-6 font-display text-4xl text-ink">Gracias.</h2>
            <p className="mt-4 text-sm text-ink/75">
              Te respondo desde mi correo personal en cuanto pueda.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-16 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Nombre" name="nombre" required />
              <Field label="Correo" name="email" type="email" required />
            </div>

            <div>
              <label className="eyebrow block text-ink/70">¿Qué te interesa?</label>
              <select
                name="motivo"
                className="mt-3 w-full border border-border bg-background/50 px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
              >
                <option>Lectura de carta astral</option>
                <option>Sesión de acompañamiento</option>
                <option>Práctica de yoga personalizada</option>
                <option>Proceso Venus (3 meses)</option>
                <option>Otra cosa / una duda</option>
              </select>
            </div>

            <div>
              <label className="eyebrow block text-ink/70">Tu mensaje</label>
              <textarea
                name="mensaje"
                required
                rows={6}
                className="mt-3 w-full resize-none border border-border bg-background/50 px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none"
                placeholder="Cuéntame qué buscas, en qué momento estás…"
              />
            </div>

            <button
              type="submit"
              className="w-full border border-gold bg-gold/10 px-6 py-4 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors"
            >
              Enviar mensaje
            </button>
          </form>
        )}
      </div>
    </>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="eyebrow block text-ink/70" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-3 w-full border border-border bg-background/50 px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
      />
    </div>
  );
}
