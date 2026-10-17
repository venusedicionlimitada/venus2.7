import { useId } from "react";
import { Sparkles, Zap } from "lucide-react";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"] as const;

/** Textos fijos de muestra: no cargan datos reales de la app. */
const TICKER_ITEMS = [
  "Luna llena · 15 OCT",
  "Mercurio directo · 22 OCT",
  "Venus en Escorpio",
  "Cuarto menguante · 28 OCT",
  "Marte trígono Júpiter",
  "Luna nueva · 01 NOV",
  "Eclipse · muestra",
  "Agenda Astral · tu mes pintado",
] as const;

/** Día / mes de muestra (fijo, coherente con el texto de la agenda). */
const SAMPLE_YEAR = 2026;
const SAMPLE_MONTH = 9; // octubre
const SAMPLE_DAY = 4;

/** Días del mes con marcas decorativas (solo visual). */
const MARKED_DAYS = new Set([3, SAMPLE_DAY, 8, 12, 21, 28]);

/** Tres hitos de muestra bajo la cuadrícula (fijos, sin cargar la app). */
const MONTH_HIGHLIGHTS = [
  { day: SAMPLE_DAY, title: "Cuarto menguante en Cáncer", tone: "bg-[#e8e2d6] text-ink" },
  { day: 8, title: "Mercurio directo", tone: "bg-ink text-cream" },
  { day: 22, title: "Venus entra en Escorpio", tone: "bg-gold text-cream" },
] as const;

type Cell = {
  key: string;
  day: number;
  inMonth: boolean;
};

function buildMonthCells(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7;
  const cells: Cell[] = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ key: `pad-${i}`, day: 0, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ key: `${year}-${month}-${day}`, day, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ key: `tail-${cells.length}`, day: 0, inMonth: false });
  }
  return cells;
}

function OrbitRings({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <div className="landing-agenda-orbit absolute inset-0 rounded-full border border-forest/20">
        <div className="absolute inset-0 -rotate-[30deg]">
          <span className="absolute -top-1.5 left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-forest md:size-4" />
          <span className="absolute -bottom-1.5 left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-gold md:size-4" />
        </div>
      </div>
      <div className="landing-agenda-orbit absolute inset-10 rounded-full border border-doradojoya/55 sm:inset-12 md:inset-14">
        <span className="absolute -top-1 left-1/2 size-3 -translate-x-1/2 rounded-full bg-wine md:size-3.5" />
        <span className="absolute -bottom-1 left-1/2 size-3 -translate-x-1/2 rounded-full bg-cream md:size-3.5" />
      </div>
      <div className="landing-agenda-orbit absolute inset-[28%] rounded-full border border-forest/25">
        <span className="absolute top-1/2 -right-1 size-2.5 -translate-y-1/2 rounded-full bg-gold md:size-3" />
        <span className="absolute top-1/2 -left-1 size-2.5 -translate-y-1/2 rounded-full bg-wine md:size-3" />
      </div>
    </div>
  );
}

/**
 * Móvil: orbes abajo del título (sin cambios).
 * Escritorio: ancladas al título, más grandes, se meten bajo la cuadrícula.
 */
function OrbitBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[200px] overflow-hidden sm:h-[230px] md:hidden"
      >
        <OrbitRings className="absolute left-1/2 top-[18%] size-[240px] -translate-x-1/2 sm:size-[280px]" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute left-[15%] top-[-2.5rem] z-0 hidden size-[480px] md:block lg:left-[10%] lg:top-[-3rem] lg:size-[560px] xl:size-[620px]"
      >
        <OrbitRings className="absolute inset-0" />
      </div>
    </>
  );
}

function TickerStrip() {
  const track = (
    <div className="flex shrink-0 items-center gap-8 pr-16 font-sans text-[10px] uppercase tracking-[0.16em] text-doradojoya">
      {TICKER_ITEMS.map((item) => (
        <span key={item} className="whitespace-nowrap">
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className="flex items-stretch bg-forest">
      <div className="min-w-0 flex-1 overflow-hidden py-2.5">
        <div className="landing-agenda-ticker flex w-max">
          {track}
          <div aria-hidden="true">{track}</div>
        </div>
      </div>
    </div>
  );
}

function MonthHighlights({ year, month }: { year: number; month: number }) {
  const mm = String(month + 1).padStart(2, "0");

  return (
    <div className="border-t border-forest/15 px-4 py-5 sm:px-5">
      <p className="text-[0.6rem] uppercase tracking-[0.16em] text-ink/45">Lo que nos trae este mes</p>
      <ul className="mt-3 space-y-2">
        {MONTH_HIGHLIGHTS.map((item) => {
          const dd = String(item.day).padStart(2, "0");
          return (
            <li key={`${item.day}-${item.title}`} className="flex items-center gap-3">
              <span
                className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] tabular-nums ${item.tone}`}
              >
                {dd}/{mm}/{year}
              </span>
              <span className="font-display text-base text-ink">{item.title}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MonthGrid({ year, month, today }: { year: number; month: number; today: number }) {
  const cells = buildMonthCells(year, month);

  return (
    <div className="overflow-hidden rounded-md border border-forest/20 bg-white shadow-[0_28px_80px_-45px] shadow-forest/40">
      <div className="border-b border-forest/15 px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-[0.6rem] uppercase tracking-[0.16em] text-ink/45">Calendario astral</p>
        <h3 className="mt-1 font-display text-2xl text-forest sm:text-3xl">
          {MONTHS[month]} {year}
        </h3>
      </div>
      <div className="grid grid-cols-7 border-l border-t border-forest/10 text-center">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            className={`border-b border-r border-forest/10 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.16em] sm:py-1.5 ${
              label === "V" ? "bg-wine text-cream" : "bg-cream/80 text-ink/45"
            }`}
          >
            {label}
          </div>
        ))}
        {cells.map((cell) => {
          const marked = cell.inMonth && MARKED_DAYS.has(cell.day);
          const isToday = cell.inMonth && cell.day === today;
          const isSample = cell.inMonth && cell.day === SAMPLE_DAY;
          return (
            <div
              key={cell.key}
              className={`relative aspect-square border-b border-r border-forest/10 p-1 sm:p-1.5 ${
                isSample
                  ? "bg-wine/[0.1] ring-2 ring-inset ring-wine/50"
                  : isToday
                    ? "bg-forest/12"
                    : marked
                      ? "bg-wine/[0.06]"
                      : ""
              }`}
            >
              {cell.inMonth ? (
                <>
                  <span
                    className={`text-[0.7rem] tabular-nums sm:text-[0.8rem] ${
                      isSample || isToday ? "font-medium text-forest" : "text-ink/70"
                    }`}
                  >
                    {cell.day}
                  </span>
                  {marked ? (
                    <span
                      aria-hidden
                      className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5"
                    >
                      <span className="size-1 rounded-full bg-gold sm:size-1.5" />
                      {cell.day % 2 === 0 ? (
                        <span className="size-1 rounded-full bg-wine sm:size-1.5" />
                      ) : null}
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>
          );
        })}
      </div>
      <MonthHighlights year={year} month={month} />
    </div>
  );
}

/** Misma luna iluminada que en la app (cuarto menguante = luz a la izquierda). */
function MenguanteMoon({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const clipId = `landing-moon-${uid}`;
  return (
    <svg viewBox="0 0 24 24" className={className ?? "size-14"} aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <circle cx="12" cy="12" r="10" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="10" fill="currentColor" className="text-ink/25" />
      <g clipPath={`url(#${clipId})`}>
        <circle cx="22" cy="12" r="10" fill="currentColor" className="text-ink/55" />
      </g>
    </svg>
  );
}

/** Panel fijo: tipografía e iconos como la agenda del día en la app. */
function DayAgendaSample() {
  const fecha = `${SAMPLE_DAY} de ${MONTHS[SAMPLE_MONTH].toLowerCase()} de ${SAMPLE_YEAR}`;

  return (
    <aside className="flex h-full min-h-72 flex-col justify-between bg-[#ebe6dc]/70 p-6 sm:p-8">
      <div>
        {/* En la app: MarcaIcono por cada título; aquí los tres del día (Propicio / Fase / Tenso). */}
        <div className="mb-6 flex items-center gap-4" aria-hidden>
          <span className="flex size-14 items-center justify-center rounded-full bg-doradojoya text-wine">
            <Sparkles className="size-5 text-[#e8d9a8]" />
          </span>
          <MenguanteMoon className="size-14" />
          <Zap className="size-10 text-wine" strokeWidth={2} />
        </div>

        <p className="text-xs text-ink/45">{fecha}</p>
        <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-wine">
          Propicio · Fase lunar · Tenso
        </p>

        {/* Móvil sin cambio; escritorio −10% solo en este título y la frase. */}
        <h3 className="mt-3 font-display text-2xl leading-[0.95] text-forest md:text-[1.62rem]">
          Luna en trígono con Venus
        </h3>
        <p className="mt-3 font-display text-base leading-tight text-forest/80">
          Cuarto menguante en Cáncer
        </p>
        <p className="mt-3 font-display text-base leading-tight text-forest/80">
          Marte en oposición con Plutón
        </p>

        <p className="mt-8 font-display text-xl leading-snug text-wine md:text-[1.35rem]">
          «Suelta con firmeza aquello que ya cumplió su ciclo, protegiendo tu paz interior sin entrar
          en batallas innecesarias.»
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <p className="font-display text-lg text-wine">Día propicio para</p>
            <p className="mt-2 font-sans text-sm leading-6 text-ink">
              Es un momento idóneo para cerrar ciclos y dejar atrás lo que ya cumplió su función.
              Favorece la introspección profunda y la resolución de asuntos íntimos que necesitaban
              cierre.
            </p>
            <ul className="mt-3 space-y-1">
              <li className="font-sans text-sm leading-6 text-ink">Terminar una relación</li>
            </ul>
          </div>
          <div>
            <p className="font-display text-lg text-wine">Lo que hay que evitar</p>
            <p className="mt-2 font-sans text-sm leading-6 text-ink">
              Conviene no imponer la voluntad a toda costa ni entrar en luchas de poder innecesarias.
              La tensión ambiental es alta, por lo que es mejor evitar decisiones drásticas o
              reacciones impulsivas que agraven los roces.
            </p>
            <ul className="mt-3 space-y-1">
              <li className="font-sans text-sm leading-6 text-ink">Tomar una gran decisión</li>
              <li className="font-sans text-sm leading-6 text-ink">Realizar una inversión</li>
              <li className="font-sans text-sm leading-6 text-ink">Una operación quirúrgica</li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-8 hidden text-xs leading-5 text-ink/50 md:block">Toca otro día para leerlo.</p>
    </aside>
  );
}

/** Vista estática de la Agenda Astral para la landing (sin datos reales de la app). */
export function LandingAgendaPreview() {
  const now = new Date();
  const today =
    now.getFullYear() === SAMPLE_YEAR && now.getMonth() === SAMPLE_MONTH ? now.getDate() : -1;

  return (
    <section className="relative overflow-hidden bg-cream pb-14 text-ink sm:pb-16 md:pb-0">
      <div className="relative mx-auto max-w-3xl px-6 pt-14 sm:pt-16 md:max-w-6xl md:pr-2 md:pt-20 lg:max-w-7xl lg:pr-3">
        {/*
          Móvil: sin cambios.
          Escritorio: más ancho al panel de mensajes (agenda del día); calendario sin crecer.
        */}
        <div className="flex flex-col md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.05fr)_minmax(0,1.4fr)] md:items-stretch md:gap-5 lg:gap-6">
          <div className="relative order-1 flex min-h-[280px] flex-col overflow-hidden pb-6 md:min-h-0 md:overflow-visible md:pb-2">
            <div className="relative z-10 max-w-md">
              <h2 className="font-display text-[clamp(2.8rem,10vw,4.4rem)] font-normal leading-[0.82] text-forest">
                Calendario
                <br />
                <span className="italic text-wine">Astral</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60 sm:text-[0.95rem]">
                Tu mes, con los tránsitos a la vista. Abre un día y la agenda te cuenta qué energía
                hay.
              </p>
            </div>
            <OrbitBackdrop />
          </div>

          <div className="order-2 -mx-6 mt-6 md:hidden">
            <TickerStrip />
          </div>

          <div className="relative z-20 order-3 mt-8 bg-cream md:order-2 md:mt-0">
            <MonthGrid year={SAMPLE_YEAR} month={SAMPLE_MONTH} today={today} />
          </div>

          <div className="relative z-10 order-4 mt-8 md:order-3 md:mt-0">
            <DayAgendaSample />
          </div>
        </div>
      </div>

      <div className="mt-12 hidden md:block">
        <TickerStrip />
      </div>
    </section>
  );
}
