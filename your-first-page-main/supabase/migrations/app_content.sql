-- Fotos por hueco y reseñas de la página /app. Cualquiera lee; solo un admin edita.
-- Las fotos se suben al bucket content-images, que ya existe.

DROP TABLE IF EXISTS public.app_photos;

CREATE TABLE public.app_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  alt text,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  name text NOT NULL,
  label text NOT NULL DEFAULT 'Venusina',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_photos TO authenticated;
GRANT ALL ON public.app_photos TO service_role;

GRANT SELECT ON public.app_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_reviews TO authenticated;
GRANT ALL ON public.app_reviews TO service_role;

ALTER TABLE public.app_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read app photos" ON public.app_photos;
CREATE POLICY "Anyone can read app photos"
  ON public.app_photos FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage app photos" ON public.app_photos;
CREATE POLICY "Admins can manage app photos"
  ON public.app_photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can read app reviews" ON public.app_reviews;
CREATE POLICY "Anyone can read app reviews"
  ON public.app_reviews FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage app reviews" ON public.app_reviews;
CREATE POLICY "Admins can manage app reviews"
  ON public.app_reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_app_photos_updated_at ON public.app_photos;
CREATE TRIGGER update_app_photos_updated_at
  BEFORE UPDATE ON public.app_photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_reviews_updated_at ON public.app_reviews;
CREATE TRIGGER update_app_reviews_updated_at
  BEFORE UPDATE ON public.app_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_reviews (quote, name, label, sort_order)
SELECT quote, name, label, sort_order
FROM (VALUES
  ('Le escribí de noche, sin preparar nada. Venus me devolvió el patrón del vínculo, no un consejo.', 'Marta', 'Venusina', 1),
  ('Abrí la sinastría y por fin vi la carta de los dos en la misma conversación.', 'Lucía', 'Venusina', 2),
  ('Puedo parar y volver. No es una sesión con hora: es mi carta, cuando yo quiero seguir.', 'Elena', 'Venusina', 3)
) AS seed(quote, name, label, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.app_reviews);
