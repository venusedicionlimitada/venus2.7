import { Link } from "@tanstack/react-router";

interface FeatureCardProps {
  item: {
    title: string;
    subtitle?: string | null;
    description?: string;
    cover_image_url?: string | null;
    date_label?: string;
  };
  linkTo: string;
  linkParams?: any;
  tagLabel: string;
  themeClasses?: string;
}

export function FeatureCard({
  item,
  linkTo,
  linkParams,
  tagLabel,
  themeClasses = "border-cream/20 bg-cream/5 text-cream hover:border-gold",
}: FeatureCardProps) {
  return (
    <div className="flex flex-col w-full">
      <Link
        to={linkTo}
        params={linkParams}
        className={`group border p-6 sm:p-8 transition-colors w-full overflow-hidden relative flex flex-col justify-between ${themeClasses} min-h-[240px] md:min-h-[350px] block`}
      >
        <div className="flex flex-col h-full justify-between min-w-0 flex-1">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl transition-colors tracking-wide">
              {item.title}
            </h2>
            {item.subtitle && (
              <p className="mt-2 font-sans text-base sm:text-lg text-cream/70 uppercase">
                {item.subtitle}
              </p>
            )}
            {item.description && (
              <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed line-clamp-3 text-cream/85">
                {item.description}
              </p>
            )}
          </div>

          <div className="mt-4 pt-2 flex justify-center">
            <span className="card-link-text inline-block text-base tracking-[0.1em] transition-colors opacity-30 group-hover:opacity-100">
              LEER PUBLICACIÓN
            </span>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between mt-3 px-1 w-full text-xs">
        <span className="eyebrow">{tagLabel}</span>
        {item.date_label && <span className="eyebrow">{item.date_label}</span>}
      </div>
    </div>
  );
}