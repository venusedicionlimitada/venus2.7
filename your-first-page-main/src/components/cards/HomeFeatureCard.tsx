import { Link } from "@tanstack/react-router";

type HomeFeatureCardProps = {
  item: {
    id: string;
    slug: string;
    date_label: string;
    title: string;
    description: string;
    body: string | null;
    cover_image_url: string | null;
    tarjetas: string;
    active?: boolean;
  };
  linkTo: string;
  linkParams: any;
  tagLabel: string;
  themeClasses: string;
};

export function HomeFeatureCard({
  item,
  linkTo,
  linkParams,
  tagLabel,
  themeClasses,
}: HomeFeatureCardProps) {
  const available = item.active !== false;
  const shell = "block group w-full max-w-[216px] sm:max-w-[250px]";
  const body = (
    <>
      <article
        className={`border transition-colors overflow-hidden flex items-center justify-center 
          w-[216px] h-[252px] p-4 
          sm:w-[250px] sm:h-[291px] sm:p-5 
          ${themeClasses}`}
      >
        {item.cover_image_url && (
          <img
            src={item.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </article>

      <div className="mt-3 sm:mt-4 text-left w-full px-0">
        <span className="eyebrow text-xs sm:text-[10px] tracking-[0.25em] opacity-70 block mb-1">
          {tagLabel}
        </span>
        <h2 className="font-display text-lg sm:text-xl text-ink transition-colors line-clamp-2 leading-snug break-words">
          {item.title}
        </h2>
        {item.description && (
          <p className="mt-2 text-xs sm:text-sm text-ink/70 line-clamp-3 leading-snug break-words">
            {item.description}
          </p>
        )}
        {!available && (
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-gold">Próximamente</p>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col items-center w-full">
      {available ? (
        <Link to={linkTo} params={linkParams} className={`${shell} cursor-pointer`}>
          {body}
        </Link>
      ) : (
        <div className={shell}>{body}</div>
      )}
    </div>
  );
}
