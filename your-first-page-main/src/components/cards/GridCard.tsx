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

export function GridCard({ item, mSecundaria, idx, themeClasses, linkTo, linkParams, tagLabel }: GridCardProps) {
  const hasImage = !!item.cover_image_url;

  return (
    <div className={`flex flex-col mb-16 ${idx % 3 === 1 ? "md:mt-20" : ""}`}>
      <article 
        className={`group flex flex-col border pt-5 px-8 pb-8 transition-colors overflow-hidden relative ${themeClasses}`}
        style={{
          width: `${616 * mSecundaria}px`,
          height: `${500 * mSecundaria}px`,
          maxWidth: "100%",
          transform: "translate(0px, 0px)"
        }}
      >
        {hasImage && (
          <img 
            src={item.cover_image_url} 
            alt="" 
            className="mt-2 w-full object-cover" 
            style={{
              width: "100%",
              height: "100%",
              maxHeight: "170px",
              transform: "translate(0px, 0px)"
            }}
          />
        )}

        {!hasImage && (
          <h2 className="mt-3 font-display text-2xl md:text-3xl transition-colors">
            {item.title}
          </h2>
        )}

        {!hasImage && (
          <p className="mt-4 text-sm leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}

        <div 
          style={{ 
            position: "absolute", 
            bottom: "32px", 
            right: "32px", 
            transform: "translate(2px, 15px)" 
          }}
        >
          <Link 
            to={linkTo} 
            params={linkParams} 
            className="inline-block eyebrow border-b pb-1 transition-colors" 
            style={{ fontSize: "11px" }}
          >
            Leer publicación
          </Link>
        </div>
      </article>

      <div 
        className="flex items-center justify-between mt-3 px-1"
        style={{ 
          width: `${616 * mSecundaria}px`, 
          maxWidth: "100%" 
        }}
      >
        <span className="eyebrow tag-secondary-label">{tagLabel}</span>
        <span className="eyebrow date-secondary-label">{item.date_label}</span>
      </div>
    </div>
  );
}