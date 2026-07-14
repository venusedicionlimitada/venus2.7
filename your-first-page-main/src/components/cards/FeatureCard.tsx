import { Link } from "@tanstack/react-router";

type FeatureCardProps = {
  item: any;
  mPrincipal: number;
  themeClasses: string;
  linkTo: string;
  linkParams: any;
  tagLabel: string;
};

export function FeatureCard({ item, mPrincipal, themeClasses, linkTo, linkParams, tagLabel }: FeatureCardProps) {
  const hasImage = !!item.cover_image_url;
  
  return (
    <div className="flex flex-col">
      <article 
        className={`group border p-8 transition-colors w-full mx-auto overflow-hidden relative ${themeClasses} ${
          hasImage ? "grid gap-8 md:grid-cols-2 md:gap-16 items-center" : "flex flex-col"
        }`}
        style={{
          width: `${1180 * mPrincipal}px`,
          height: `${400 * mPrincipal}px`,
          maxWidth: "100%",
          transform: "translate(-40px, 0px)"
        }}
      >
        {hasImage && (
          <img 
            src={item.cover_image_url} 
            alt="" 
            className="w-full object-contain aspect-[4/3]" 
            style={{
              width: "100%",
              height: "auto",
              maxHeight: `${350 * mPrincipal}px`,
              transform: "translate(-90px, -15px)"
            }}
          />
        )}
        <div className="flex flex-col h-full justify-high">
          <h2 
            className="mt-4 font-display text-4xl md:text-4xl transition-colors" 
            style={{ 
              transform: "translateX(-160px) translateY(-30px)",
              width: "calc(80% + 160px)"
            }}
          >
            {item.title}
          </h2>
          <h2 
            className="mt-4 font-sans leading-relaxed line-clamp-4" 
            style={{ 
              transform: "translateX(-160px) translateY(-40px)",
              fontSize: "16px",
              lineHeight: "1.4",
              letterSpacing: "0.4px",
              fontWeight: "400",
              width: "calc(80% + 160px)"
            }} 
          >
            {item.description}
          </h2>
          
          {!hasImage && item.body && (
            <div className="prose prose-sm max-w-none opacity-60 line-clamp-6 mt-6 pt-6 border-t border-current/10">
              <div dangerouslySetInnerHTML={{ __html: item.body }} />
            </div>
          )}

          <div style={{ position: "absolute", bottom: "32px", right: "32px", transform: "translate(0px, 10px)" }}>
            <Link 
              to={linkTo} 
              params={linkParams}
              className="inline-block eyebrow border-b border-granate/40 pb-1 transition-colors"
              style={{ letterSpacing: "1px" }}
            >
              Leer más
            </Link>
          </div>
        </div>
      </article>

      <div 
        className="flex items-center justify-between mt-3 px-1"
        style={{ 
          width: `${1165 * mPrincipal}px`, 
          maxWidth: "100%",
          transform: "translate(-30px, 0px)"
        }}
      >
        <span className="eyebrow tag-label">{tagLabel}</span>
        <span className="eyebrow date-label">{item.date_label}</span>
      </div>
    </div>
  );
}