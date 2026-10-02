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
