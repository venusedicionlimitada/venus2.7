import { type ReactNode } from "react";

export function Label({ children }: { children: ReactNode }) {
  return <label className="eyebrow block text-ink/70">{children}</label>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="mt-2 w-full border border-border bg-background/50 px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none" />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="mt-2 w-full resize-y border border-border bg-background/50 px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none" />;
}

export function PrimaryButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className="border border-gold bg-gold/10 px-5 py-2.5 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors disabled:opacity-50">
      {children}
    </button>
  );
}

export function GhostButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className="border border-border px-4 py-2 text-[0.7rem] uppercase tracking-[0.25em] text-ink/70 hover:border-gold hover:text-gold">
      {children}
    </button>
  );
}

export function Section<T>({ title, items, renderItem, onNew, modal }: {
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

export function ItemRow({ title, subtitle, published, onEdit, onDelete }: {
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

export function EditorModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
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