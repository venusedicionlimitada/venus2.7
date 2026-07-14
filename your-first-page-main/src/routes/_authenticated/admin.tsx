import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { DiarySection } from "@/components/admin/sections/DiarySection";
import { AstrologySection } from "@/components/admin/sections/AstrologySection";
import { YogaSection } from "@/components/admin/sections/YogaSection";
import { ResourcesSection } from "@/components/admin/sections/ResourcesSection";
import { ServicesSection } from "@/components/admin/sections/ServicesSection";
import { EventsSection } from "@/components/admin/sections/EventsSection";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel · Venus" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Tab = "diario" | "astrologia" | "yoga" | "recursos" | "servicios" | "eventos";

function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useAuth();
  const [tab, setTab] = useState<Tab>("diario");

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/", replace: true });
  }, [loading, isAdmin, navigate]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (loading) return <div className="mx-auto max-w-5xl px-6 py-24 text-center text-ink/60">Cargando…</div>;
  if (!isAdmin) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <p className="eyebrow text-gold">Panel privado</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Tu contenido</h1>
          <p className="mt-1 text-xs text-ink/50">{user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[0.7rem] uppercase tracking-[0.25em] text-ink/60 hover:text-gold">Ver web →</Link>
          <button onClick={handleSignOut} className="border border-border px-4 py-2 text-[0.7rem] uppercase tracking-[0.25em] text-ink/70 hover:border-gold hover:text-gold">
            Salir
          </button>
        </div>
      </header>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-border/40">
        {(["diario", "astrologia", "yoga", "recursos", "servicios", "eventos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-xs uppercase tracking-[0.25em] transition-colors ${
              tab === t ? "border-b-2 border-gold text-gold" : "text-ink/60 hover:text-ink"
            }`}
          >
            {t === "diario" ? "Diario" : t === "astrologia" ? "Astrología" : t === "yoga" ? "Yoga" : t === "recursos" ? "Recursos" : t === "servicios" ? "Terapias" : t === "eventos" ? "Eventos" : ""}
          </button>
        ))}
      </nav>

      <div className="mt-10">
        {tab === "diario" && <DiarySection />}
        {tab === "astrologia" && <AstrologySection />}
        {tab === "yoga" && <YogaSection />}
        {tab === "recursos" && <ResourcesSection />}
        {tab === "servicios" && <ServicesSection />}
        {tab === "eventos" && <EventsSection />}
      </div>
    </div>
  );
}