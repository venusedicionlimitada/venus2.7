import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/SiteHeader";
import { AuthProvider } from "../lib/use-auth";
import { SiteFooter } from "../components/SiteFooter";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow text-gold">404</p>
        <h1 className="mt-4 font-display text-5xl text-ink">Página no encontrada</h1>
        <p className="mt-4 text-sm text-ink/70">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-gold px-6 py-3 text-xs uppercase tracking-[0.3em] text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-ink">Algo se desalineó</h1>
        <p className="mt-3 text-sm text-ink/70">
          Vuelve a intentarlo o regresa al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="border border-gold px-5 py-2 text-xs uppercase tracking-[0.3em] text-gold hover:bg-gold hover:text-primary-foreground transition-colors"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="border border-border px-5 py-2 text-xs uppercase tracking-[0.3em] text-ink/80 hover:border-gold hover:text-gold transition-colors"
          >
            Inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Venus Edición Limitada · Terapias de yoga y astrología" },
      { name: "description", content: "Acompañamiento terapéutico desde el yoga y la astrología. Reflexiones, recursos descargables y consultas personales." },
      { name: "author", content: "Venus Edición Limitada" },
      { property: "og:title", content: "Venus Edición Limitada" },
      { property: "og:description", content: "Terapias de acompañamiento que tejen yoga y astrología en un ritual sensorial." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const router = useRouter();
  const queryClient = new QueryClient(); // Definimos el cliente aquí

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}