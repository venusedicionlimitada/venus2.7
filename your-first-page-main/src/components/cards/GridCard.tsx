import { Link } from "@tanstack/react-router";

type GridCardProps = {
  item: any;
  mSecundaria: number;
  idx: number;
  themeClasses: string;
  linkTo: string;
  linkParams: any;
  tagLabel: string;
};

export function GridCard({ item, idx, themeClasses, linkTo, linkParams, tagLabel }: GridCardProps) {
  const hasImage = !!item.cover_image_url;

  return (
    <div className={`flex flex-col mb-10 sm:mb-16 w-full ${idx % 3 === 1 ? "md:mt-20" : ""}`}>
      <article 
        className={`group flex flex-col border pt-5 px-5 sm:px-8 pb-8 transition-colors overflow-hidden relative w-full min-h-[320px] sm:min-h-[380px] md:min-h-[300px] ${themeClasses}`}
      >
        {hasImage && (
          <img 
            src={item.cover_image_url} 
            alt="" 
            className="mt-2 w-full object-cover max-h-36 sm:max-h-44" 
          />
        )}

        {!hasImage && (
          <>
            <h2 className="mt-3 font-display text-xl sm:text-2xl md:text-3xl transition-colors">
              {item.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </>
        )}

        <div className="mt-auto pt-6 flex justify-end sm:absolute sm:bottom-8 sm:right-8 sm:translate-y-4">
          <Link 
            to={linkTo} 
            params={linkParams} 
            className="inline-block eyebrow border-b pb-1 transition-colors text-[11px]" 
          >
            Leer publicación
          </Link>
        </div>
      </article>

      <div className="flex items-center justify-between mt-3 px-1 w-full">
        <span className="eyebrow tag-secondary-label">{tagLabel}</span>
        <span className="eyebrow date-secondary-label">{item.date_label}</span>
      </div>
    </div>
  );
}
