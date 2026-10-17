import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { isLandingHost } from "@/lib/landingHost";
import {
  getLandingAnalyticsConsent,
  initLandingAnalytics,
  setLandingAnalyticsConsent,
} from "@/lib/landingAnalytics";

export function LandingCookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLandingHost()) return;
    initLandingAnalytics();
    if (getLandingAnalyticsConsent() === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/40 bg-[#2c241c]/95 px-4 py-4 text-cream shadow-[0_-8px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 md:max-w-5xl md:flex-row md:items-center md:justify-between">
        <p className="text-left text-[0.8rem] leading-relaxed text-cream/90 sm:text-[0.85rem]">
          Usamos cookies para mejorar el funcionamiento de la web.”{" "}
          <Link to="/cookies" className="underline decoration-gold/70 underline-offset-2 hover:text-gold">
            Política de cookies
          </Link>
          {" · "}
          <Link to="/privacidad" className="underline decoration-gold/70 underline-offset-2 hover:text-gold">
            Privacidad
          </Link>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            className="border border-cream/35 px-4 py-2 text-[0.65rem] uppercase tracking-[0.22em] text-cream/80 transition-colors hover:border-cream hover:text-cream"
            onClick={() => {
              setLandingAnalyticsConsent("denied");
              setVisible(false);
            }}
          >
            No, gracias
          </button>
          <button
            type="button"
            className="border border-gold bg-granate px-4 py-2 text-[0.65rem] uppercase tracking-[0.22em] text-cream transition-colors hover:bg-gold hover:text-granate"
            onClick={() => {
              setLandingAnalyticsConsent("granted");
              setVisible(false);
            }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
