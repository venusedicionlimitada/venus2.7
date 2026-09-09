import { Link } from "@tanstack/react-router";
import { InCardCoverImage } from "@/components/SideRecommendImage";

type FeatureCardProps = {
  item: any;
  mPrincipal?: number;
  themeClasses: string;
  linkTo: string;
  linkParams: any;
  tagLabel: string;
};

export function FeatureCard({ item, themeClasses, linkTo, linkParams, tagLabel }: FeatureCardProps) {
  return (
    <div className="flex flex-col w-full">
      <article
        className={`group border p-5 sm:p-8 sm:pl-12 transition-colors w-full overflow-hidden relative flex flex-col justify-between ${themeClasses} min-h-[240px] md:min-h-[350px]`}
      >
        <div className="flex flex-col h-full justify-between min-w-0 flex-1">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl transition-colors tracking-wide">
              {item.title}
            </h2>
            <p className="mt-3 font-sans text-base sm:text-lg leading-relaxed line-clamp-3 max-w-xl">
              {item.description}
            </p>
          </div>

          <InCardCoverImage src={item.cover_image_url} />

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