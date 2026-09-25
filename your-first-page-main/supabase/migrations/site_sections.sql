-- Pausa de una sección entera.
-- active = false: la página pública solo muestra «Próximamente».

CREATE TABLE IF NOT EXISTS public.site_sections (
  id text PRIMARY KEY,
  active boolean NOT NULL DEFAULT true
);

INSERT INTO public.site_sections (id, active) VALUES
  ('diario', true),
  ('astrologia', true),
  ('yoga', true),
  ('recursos', true),
  ('servicios', true),
  ('eventos', true),
  ('sobre-mi', true),
  ('app', true)
ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON public.site_sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_sections TO authenticated;
GRANT ALL ON public.site_sections TO service_role;

ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read section flags" ON public.site_sections;
CREATE POLICY "Anyone can read section flags"
  ON public.site_sections FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage section flags" ON public.site_sections;
CREATE POLICY "Admins can manage section flags"
  ON public.site_sections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
