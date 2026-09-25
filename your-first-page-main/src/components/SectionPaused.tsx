import { SiteHeader } from "@/components/SiteHeader";

export function SectionPaused({ className = "" }: { className?: string }) {
  return (
    <>
      <SiteHeader />
      <div className={`flex min-h-[70vh] items-center justify-center px-6 ${className}`}>
        <p className="font-display text-4xl tracking-wide md:text-6xl">Próximamente</p>
      </div>
    </>
  );
}
