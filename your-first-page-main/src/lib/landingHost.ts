import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";

/** Subdominio de la promo. La web principal sigue en el dominio raíz. */
export const LANDING_HOST = "descubre.venusedicionlimitada.com";

const OPEN_ON_LANDING_HOST = new Set(["/", "/aviso-legal", "/privacidad", "/cookies"]);

const currentHost = createIsomorphicFn()
  .client(() => window.location.hostname)
  .server(() => getRequestHost({ xForwardedHost: true }).split(":")[0]);

export function isLandingHost() {
  return currentHost().trim().toLowerCase() === LANDING_HOST;
}

export function landingHostPathAllowed(pathname: string) {
  return OPEN_ON_LANDING_HOST.has(pathname);
}

/** La promo y el entorno local se ven sin clave. El resto pide el acceso de /admin. */
const GATE_FREE_HOSTS = new Set([LANDING_HOST, "localhost", "127.0.0.1", "::1"]);

export function siteRequiresGate() {
  const host = currentHost().trim().toLowerCase();
  return host.length > 0 && !GATE_FREE_HOSTS.has(host);
}
