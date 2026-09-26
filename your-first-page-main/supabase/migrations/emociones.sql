-- Ficha de cada emoción (Astrología emocional).
-- El vínculo con eventos y publicaciones sigue siendo el texto de categoria_emocional.

CREATE TABLE IF NOT EXISTS public.emociones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  subtitulo text,
  descripcion text,
  cover_image_url text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS emociones_nombre_lower_key ON public.emociones (lower(nombre));

GRANT SELECT ON public.emociones TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.emociones TO authenticated;
GRANT ALL ON public.emociones TO service_role;

ALTER TABLE public.emociones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published emociones" ON public.emociones;
CREATE POLICY "Anyone can read published emociones"
  ON public.emociones FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage emociones" ON public.emociones;
CREATE POLICY "Admins can manage emociones"
  ON public.emociones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_emociones_updated_at ON public.emociones;
CREATE TRIGGER update_emociones_updated_at
  BEFORE UPDATE ON public.emociones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
