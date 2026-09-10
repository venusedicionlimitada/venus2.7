import { Link } from "@tanstack/react-router";

type GridCardProps = {
  item: {
    title: string;
    subtitle?: string | null;
    description?: string;
    date_label?: string;
    [key: string]: any;
  };
  mSecundaria: number;
  idx: number;
  themeClasses: string;
  linkTo: string;
  linkParams: any;
  tagLabel: string;
};

export function GridCard({ item, idx, themeClasses, linkTo, linkParams, tagLabel }: GridCardProps) {
  return (
    <div className={`flex flex-col mb-10 sm:mb-16 w-full ${idx % 3 === 1 ? "md:mt-20" : ""}`}>
      <Link 
        to={linkTo} 
        params={linkParams} 
        className={`group flex flex-col border pt-5 px-5 sm:px-8 pb-8 transition-colors overflow-hidden relative w-full min-h-[320px] sm:min-h-[380px] md:min-h-[300px] block ${themeClasses}`}
      >
        <h2 className="mt-3 font-display text-xl sm:text-2xl md:text-3xl transition-colors">
          {item.title}
        </h2>
        {item.subtitle && (
          <p className="mt-1.5 text-xs sm:text-sm tracking-wider uppercase opacity-80">
            {item.subtitle}
          </p>
        )}
        <p className="mt-4 text-sm leading-relaxed line-clamp-2">
          {item.description}
        </p>

        <div className="mt-auto pt-6 flex justify-center sm:absolute sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2">
          <span className="inline-block eyebrow transition-colors text-[11px] opacity-0 group-hover:opacity-100">
            Leer publicación
          </span>
        </div>
      </Link>

      <div className="flex items-center justify-between mt-3 px-1 w-full">
        <span className="eyebrow tag-secondary-label">{tagLabel}</span>
        <span className="eyebrow date-secondary-label">{item.date_label}</span>
      </div>
    </div>
  );
}