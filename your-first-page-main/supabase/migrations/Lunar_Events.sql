-- LUNAR EVENTS (El widget)
-- =========================================================
CREATE TABLE public.lunar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  subtitulo text NOT NULL,
  descripcion text,
  cover_image_url text,
  fecha_evento date NOT NULL,
  hora_evento time NOT NULL,
  published boolean NOT NULL DEFAULT false,
  related_article_ids uuid[] DEFAULT '{}', 
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Permisos y Seguridad
GRANT SELECT ON public.lunar_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lunar_events TO authenticated;
GRANT ALL ON public.lunar_events TO service_role;
ALTER TABLE public.lunar_events ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Anyone can read published events"
  ON public.lunar_events FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage events"
  ON public.lunar_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger para fecha de actualización
CREATE TRIGGER update_lunar_events_updated_at
  BEFORE UPDATE ON public.lunar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();