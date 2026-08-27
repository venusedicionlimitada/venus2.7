import { Link } from "@tanstack/react-router";

type FeatureCardProps = {
  item: any;
  mPrincipal?: number;
  themeClasses: string;
  linkTo: string;
  linkParams: any;
  tagLabel: string;
};

export function FeatureCard({ item, themeClasses, linkTo, linkParams, tagLabel }: FeatureCardProps) {
  const hasImage = !!item.cover_image_url;

  return (
    <div className="flex flex-col w-full">
      <article
        className={`group border p-5 sm:p-8 sm:pl-12 transition-colors w-full overflow-hidden relative flex flex-col justify-between ${themeClasses} min-h-[240px] md:min-h-[350px] ${
          hasImage ? "md:grid md:grid-cols-2 md:gap-8 md:items-center" : ""
        }`}
      >
        {hasImage && (
          <img
            src={item.cover_image_url}
            alt=""
            className="w-full object-cover max-h-44 md:max-h-[280px]"
          />
        )}

        <div className="flex flex-col h-full justify-between min-w-0 flex-1">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl transition-colors tracking-wide">
              {item.title}
            </h2>
            <p className="mt-3 font-sans text-base sm:text-lg leading-relaxed line-clamp-3 max-w-xl">
              {item.description}
            </p>
          </div>

          {!hasImage && item.body && (
            <div className="prose prose-sm max-w-none opacity-60 line-clamp-4 mt-4 pt-4 border-t border-current/10">
              <div dangerouslySetInnerHTML={{ __html: item.body }} />
            </div>
          )}

          <div className="mt-4 pt-2 flex justify-end">
            <Link
              to={linkTo}
              params={linkParams}
              className="inline-block border-b pb-0.5 text-base italic tracking-[0.1em] transition-colors opacity-70 group-hover:opacity-100"
            >
              Leer más
            </Link>
          </div>
        </div>
      </article>

      <div className="flex items-center justify-between mt-3 px-1 w-full">
        <span className="eyebrow tag-label">{tagLabel}</span>
        <span className="eyebrow date-label">{item.date_label}</span>
      </div>
    </div>
  );
}
