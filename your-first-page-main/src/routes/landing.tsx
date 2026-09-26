import { createFileRoute } from "@tanstack/react-router";
import { AppLandingBody } from "@/components/app/AppLandingBody";
import { LandingBar } from "@/components/app/LandingBar";
import { LandingFooter } from "@/components/app/LandingFooter";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Venus App · Cuéntale a Venus" },
      {
        name: "description",
        content:
          "Consulta personalizada de astrología emocional. Tu carta y la sinastría, en conversación. 14 días de demo gratuita.",
      },
      { property: "og:title", content: "Venus App · Conversa a tu Ritmo" },
      {
        property: "og:description",
        content: "Tu carta y la sinastría, a tu ritmo. 14 días de demo gratuita.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <LandingBar />
      <AppLandingBody />
      <LandingFooter />
    </>
  );
}
