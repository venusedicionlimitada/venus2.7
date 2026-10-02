-- Galería entre «Tu carta, o la de dos» y la foto.
-- Las frases y las fotos rotan por separado.
-- Las fotos viven en app_photos con slot = galeria.

ALTER TABLE public.app_photos
  ADD COLUMN IF NOT EXISTS slot text NOT NULL DEFAULT 'responde';

ALTER TABLE public.app_photos
  DROP CONSTRAINT IF EXISTS app_photos_slot_check;

ALTER TABLE public.app_photos
  ADD CONSTRAINT app_photos_slot_check CHECK (slot IN ('responde', 'carta', 'galeria'));

CREATE TABLE IF NOT EXISTS public.app_gallery_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_gallery_lines TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_gallery_lines TO authenticated;
GRANT ALL ON public.app_gallery_lines TO service_role;

ALTER TABLE public.app_gallery_lines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read app gallery lines" ON public.app_gallery_lines;
CREATE POLICY "Anyone can read app gallery lines"
  ON public.app_gallery_lines FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage app gallery lines" ON public.app_gallery_lines;
CREATE POLICY "Admins can manage app gallery lines"
  ON public.app_gallery_lines FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_app_gallery_lines_updated_at ON public.app_gallery_lines;
CREATE TRIGGER update_app_gallery_lines_updated_at
  BEFORE UPDATE ON public.app_gallery_lines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_gallery_lines (body, sort_order)
SELECT body, sort_order
FROM (VALUES
  ('Clima Astral', 1),
  ('Tu carta natal', 2),
  ('Clima Astral Personalizado', 3),
  ('organiza tu día según los tránsitos', 4),
  ('descubre tus talentos innatos', 5),
  ('Informes de tu carta natal personalizados', 6),
  ('tu lenguaje del amor', 7),
  ('informes natales personalizados', 8),
  ('sinastrías', 9),
  ('descubre el lenguaje del amor de tu pareja', 10),
  ('compatibilidad de amistades', 11),
  ('¿tienes un evento importante? descubre la energía de ese día', 12),
  ('a tu propio ritmo', 13),
  ('resuelve tus dudas', 14),
  ('te ayuda a tomar decisiones', 15),
  ('tu carta natal en la palma de tu mano', 16),
  ('compatibilidad de pareja', 17)
) AS seed(body, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.app_gallery_lines);
