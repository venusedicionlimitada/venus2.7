-- Página pública /sobre-mi. Una sola fila. Cualquiera lee; solo un admin edita.

CREATE TABLE IF NOT EXISTS public.sobre_mi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  lead text,
  body text,
  formacion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sobre_mi TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sobre_mi TO authenticated;
GRANT ALL ON public.sobre_mi TO service_role;

ALTER TABLE public.sobre_mi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read sobre mi" ON public.sobre_mi;
CREATE POLICY "Anyone can read sobre mi"
  ON public.sobre_mi FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage sobre mi" ON public.sobre_mi;
CREATE POLICY "Admins can manage sobre mi"
  ON public.sobre_mi FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_sobre_mi_updated_at ON public.sobre_mi;
CREATE TRIGGER update_sobre_mi_updated_at
  BEFORE UPDATE ON public.sobre_mi
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.sobre_mi (title, lead, body, formacion)
SELECT
  'El gesto de acompañar.',
  'Bienvenida. Este es un espacio íntimo, hecho a fuego lento.',
  '<p>[Reemplaza este texto con tu historia.] Soy quien sostiene Venus Edición Limitada: una práctica nacida del cruce entre el yoga, la astrología y el deseo profundo de acompañar a otras personas en sus procesos de transformación.</p><p>Mi camino comenzó… [continúa contando tu historia: formación, qué te llevó al yoga, cómo entró la astrología en tu vida, qué entiendes hoy por acompañamiento terapéutico].</p><p>Hoy ofrezco sesiones individuales, lecturas de carta astral y recursos que puedas llevarte a casa. Cada propuesta nace de la escucha y se adapta a tu momento.</p>',
  '[Formación 1 en yoga / linaje / horas]
[Formación 2 en astrología / escuela]
[Otras herramientas de acompañamiento]'
WHERE NOT EXISTS (SELECT 1 FROM public.sobre_mi);
