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

export function ItemRow({ title, subtitle, published, onEdit, onDelete, onPreview }: {
  title: string; subtitle: string; published: boolean; onEdit: () => void; onDelete: () => void; onPreview?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-background p-5">
      <div className="min-w-0">
        <p className="truncate font-display text-lg text-ink">{title}</p>
        <p className="mt-0.5 text-xs uppercase tracking-widest text-ink/55">{subtitle} · {published ? <span className="text-gold">Publicado</span> : <span>Borrador</span>}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        {onPreview && <GhostButton onClick={onPreview}>Vista previa</GhostButton>}
        <GhostButton onClick={onEdit}>Editar</GhostButton>
        <GhostButton onClick={onDelete}>Borrar</GhostButton>
      </div>
    </div>
  );
}

export type ArticlePreview = {
  section: string;
  title: string;
  subtitle?: string | null;
  dateLabel?: string | null;
  description?: string | null;
  body?: string | null;
  coverImageUrl?: string | null;
  badge?: string | null;
  category?: string | null;
  href?: string | null;
  published: boolean;
};

export function ArticlePreviewModal({ article, onClose }: { article: ArticlePreview; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-background">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-6 py-4 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
          Vista previa · {article.section}
          {article.published ? "" : " · borrador"}
        </p>
        <div className="flex gap-2">
          {article.href && article.published && (
            <a href={article.href} target="_blank" rel="noreferrer" className="border border-border px-4 py-2 text-[0.7rem] uppercase tracking-[0.25em] text-ink/70 hover:border-gold hover:text-gold">
              Abrir en el sitio
            </a>
          )}
          <GhostButton type="button" onClick={onClose}>Cerrar</GhostButton>
        </div>
      </div>
      <article className="mx-auto max-w-5xl px-6 py-16">
        {article.coverImageUrl ? (
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,300px)_1fr] md:gap-12">
            <div className="mx-auto w-full max-w-[300px] md:mx-0">
              <img src={article.coverImageUrl} alt="" className="block h-auto w-full object-cover" />
            </div>
            <PreviewHeader article={article} />
          </div>
        ) : (
          <PreviewHeader article={article} />
        )}
        {article.body && (
          <div
            className="prose prose-sm mt-12 w-full max-w-none text-base text-ink/85 prose-headings:font-display prose-headings:text-ink prose-a:text-wine prose-strong:text-ink prose-p:leading-normal sm:prose-lg"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />
        )}
        {article.category && (
          <p className="eyebrow mb-2 mt-16 inline-block border border-gold px-4 py-2 text-ink">{article.category}</p>
        )}
      </article>
    </div>
  );
}

function PreviewHeader({ article }: { article: ArticlePreview }) {
  return (
    <header className="flex w-full min-w-0 flex-col">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <span className="eyebrow text-gold">{article.badge}</span>
        <span className="eyebrow text-right text-clay">{article.dateLabel}</span>
      </div>
      <h1 className="mt-4 w-full break-words font-display text-3xl leading-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl">
        {article.title}
      </h1>
      {article.subtitle && (
        <p className="mt-4 w-full font-sans text-lg leading-relaxed text-ink sm:text-xl md:text-[22px]">{article.subtitle}</p>
      )}
      {article.description && (
        <p className="mt-6 w-full text-base leading-relaxed text-ink/75 md:text-lg">{article.description}</p>
      )}
    </header>
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