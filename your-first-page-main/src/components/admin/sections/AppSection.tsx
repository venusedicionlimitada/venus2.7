import { SectionPauseControl } from "@/components/admin/SectionPauseControl";

export function AppSection() {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Venus App</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
        La landing pública está en /app. El botón lleva a app.venusedicionlimitada.com,
        donde se crea la cuenta. Desactivada, la página sigue en el menú y solo muestra «Próximamente».
      </p>
      <div className="mt-6">
        <SectionPauseControl section="app" />
      </div>
    </div>
  );
}
