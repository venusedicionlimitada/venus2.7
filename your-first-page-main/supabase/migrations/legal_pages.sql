-- Páginas de texto (aviso legal, privacidad, cookies y las que se añadan).
-- El pie no lee esta tabla: sus enlaces siguen fijos.
-- published = false: la dirección responde como página no encontrada.
-- published y active = false: la página muestra «Próximamente».

CREATE TABLE IF NOT EXISTS public.legal_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body text,
  published boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.legal_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.legal_pages TO authenticated;
GRANT ALL ON public.legal_pages TO service_role;

ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published legal pages" ON public.legal_pages;
CREATE POLICY "Anyone can read published legal pages"
  ON public.legal_pages FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage legal pages" ON public.legal_pages;
CREATE POLICY "Admins can manage legal pages"
  ON public.legal_pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_legal_pages_updated_at ON public.legal_pages;
CREATE TRIGGER update_legal_pages_updated_at
  BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.legal_pages (slug, title, body, published, active, sort_order)
VALUES
  (
    'aviso-legal',
    'Aviso Legal',
    $html$<p>Este texto es un ejemplo para ver la página. Sustitúyelo por el aviso legal definitivo.</p><p>Venus Edición Limitada es el espacio desde el que se ofrece este acompañamiento. Aquí irá quién está detrás de la web y cómo contactar.</p><h2>Identificación</h2><p>Nombre, domicilio y correo. Una frase en <strong>negrita</strong> y otra en <em>cursiva</em> para comprobar que el formato se pinta.</p>$html$,
    true,
    true,
    1
  ),
  (
    'privacidad',
    'Política de Privacidad',
    $html$<p>Este texto es un ejemplo. Sustitúyelo por la política de privacidad definitiva.</p><p>Aquí se explica qué datos se recogen cuando escribes o te suscribes a la newsletter, y para qué se usan.</p><h2>Datos</h2><p>El correo y el mensaje del formulario. El detalle legal lo completarás tú. Esto solo sirve para <strong>ver el diseño</strong>.</p>$html$,
    true,
    true,
    2
  ),
  (
    'cookies',
    'Política de Cookies',
    $html$<p>Este texto es un ejemplo. Sustitúyelo por la política de cookies definitiva.</p><p>Aquí se dirá qué cookies usa la web, cuáles son técnicas y cómo se pueden <em>aceptar o rechazar</em>.</p>$html$,
    true,
    true,
    3
  )
ON CONFLICT (slug) DO NOTHING;
