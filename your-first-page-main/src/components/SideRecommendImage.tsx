import venusSideImage from "@/assets/Venus_08.jpg";

type SideImageProps = {
  src?: string | null;
};

/** Imagen lateral desde la publicación principal, o Venus si no hay foto — 300×350px en escritorio */
export function SideRecommendImage({ src }: SideImageProps) {
  return (
    <div className="hidden md:block shrink-0 group border p-6 transition-colors overflow-hidden border-cream/30 bg-cream/5 hover:border-gold w-[300px] h-[350px] -translate-x-2.5">
      <img src={src || venusSideImage} alt="" className="w-full h-full object-cover" />
    </div>
  );
}

/** Misma imagen dentro de la tarjeta en móvil, sin recortar el formato original */
export function InCardCoverImage({ src }: SideImageProps) {
  return (
    <img
      src={src || venusSideImage}
      alt=""
      className="md:hidden mt-4 w-full h-auto shrink-0 object-contain"
    />
  );
}
