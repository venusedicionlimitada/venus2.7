import { isLandingHost } from "@/lib/landingHost";

const CONSENT_KEY = "venus_landing_analytics_consent";
const MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || "G-562PFP4LVN";

type ConsentValue = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function canRun() {
  return typeof window !== "undefined" && isLandingHost() && Boolean(MEASUREMENT_ID);
}

export function getLandingAnalyticsConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  if (value === "granted" || value === "denied") return value;
  return null;
}

function ensureGtag() {
  if (!canRun()) return;
  if (typeof window.gtag === "function") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

function enableAnalytics() {
  ensureGtag();
  if (typeof window.gtag !== "function") return;

  window.gtag("consent", "update", {
    analytics_storage: "granted",
  });
  window.gtag("config", MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Arranca el conteo solo en el subdominio de la landing y solo si ya aceptaron. */
export function initLandingAnalytics() {
  if (!canRun()) return;
  ensureGtag();
  if (getLandingAnalyticsConsent() === "granted") {
    enableAnalytics();
  }
}

export function setLandingAnalyticsConsent(value: ConsentValue) {
  if (!canRun()) return;
  window.localStorage.setItem(CONSENT_KEY, value);
  ensureGtag();
  if (value === "granted") {
    enableAnalytics();
    return;
  }
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
  });
}

/** Clic en el botón que lleva a la app. */
export function trackLandingAppClick(label: string) {
  if (!canRun()) return;
  if (getLandingAnalyticsConsent() !== "granted") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "click_ir_a_app", {
    event_category: "landing",
    event_label: label,
    link_url: "https://app.venusedicionlimitada.com",
  });
}
