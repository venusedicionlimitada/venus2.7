/** Franja fija de la landing. El mismo bloque Venus, sin menú y sin salida al resto del sitio. */
export function LandingBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md sm:bg-background/85">
      <div className="mx-auto flex max-w-7xl items-center px-6 py-2 md:py-3">
        <div className="flex w-auto max-w-[180px] flex-col justify-start leading-none sm:max-w-[220px]">
          <span className="truncate font-display text-xl text-ink sm:text-[2rem]">VENUS</span>
          <span className="mt-1.5 hidden translate-x-[2px] truncate font-sans text-[0.6rem] font-normal uppercase tracking-[0.1em] text-ink sm:mt-0 sm:block sm:translate-x-[2.5px] sm:translate-y-[1px]">
            Edición Limitada
          </span>
        </div>
      </div>
    </header>
  );
}
