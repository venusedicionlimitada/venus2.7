-- Pasos del bloque de reseñas (01 Cuenta, 02 Datos, 03 Conversación).
-- Cualquiera lee; solo un admin edita.

CREATE TABLE IF NOT EXISTS public.app_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marker text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_steps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_steps TO authenticated;
GRANT ALL ON public.app_steps TO service_role;

ALTER TABLE public.app_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read app steps" ON public.app_steps;
CREATE POLICY "Anyone can read app steps"
  ON public.app_steps FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage app steps" ON public.app_steps;
CREATE POLICY "Admins can manage app steps"
  ON public.app_steps FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_app_steps_updated_at ON public.app_steps;
CREATE TRIGGER update_app_steps_updated_at
  BEFORE UPDATE ON public.app_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_steps (marker, title, body, sort_order)
SELECT marker, title, body, sort_order
FROM (VALUES
  ('01', 'Consulta astrológica con tu carta', 'Pregunta tus inquietudes', 1),
  ('02', 'Tu configuración astral', 'Siempre disponible', 2),
  ('03', 'Informes personalizados de tu carta natal', 'Tu mapa al detalle', 3),
  ('04', 'Sinastrías', 'Compatibilidad con tus vínculos', 4),
  ('05', 'Consulta de sinastrías', 'Pregúntale al instante acerca de vuestra relación', 5),
  ('06', 'Clima Astral', 'La energía del día que quieras', 6),
  ('07', 'Clima Astral Personalizado', 'Descubre la energía disponible para ti', 7)
) AS seed(marker, title, body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.app_steps);
