import { createFileRoute } from "@tanstack/react-router";
import { AppLandingBody } from "@/components/app/AppLandingBody";
import { LandingBar } from "@/components/app/LandingBar";
import { LandingFooter } from "@/components/app/LandingFooter";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Venus App · Astrología Emocional, Sinastrías y Clima Astral" },
      {
        name: "description",
        content:
          "Consultas por tu carta natal, por una sinastría o por el clima astral, y Venus te responde según tu carta.",
      },
      { property: "og:title", content: "Venus App · Astrología Emocional, Sinastrías y Clima Astral" },
      {
        property: "og:description",
        content: "Consultas por tu carta natal, por una sinastría o por el clima astral, y Venus te responde según tu carta.",
      },
      { property: "og:image", content: "https://descubre.venusedicionlimitada.com/og-landing.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Venus. Astrología emocional." },
    ],
  }),
  component: LandingPage,
});

export function LandingPage() {
  return (
    <>
      <LandingBar />
      <AppLandingBody />
      <LandingFooter />
    </>
  );
}
