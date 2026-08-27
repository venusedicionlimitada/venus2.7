import venusSideImage from "@/assets/Venus_08.jpg";

/** Imagen lateral fija desde assets — 300×350px, igual que en la página principal */
export function SideRecommendImage() {
  return (
    <div className="hidden md:block shrink-0 group border p-6 transition-colors overflow-hidden border-cream/30 bg-cream/5 hover:border-gold w-[300px] h-[350px] -translate-x-2.5">
      <img src={venusSideImage} alt="Contenido Recomendado" className="w-full h-full object-cover" />
    </div>
  );
}
