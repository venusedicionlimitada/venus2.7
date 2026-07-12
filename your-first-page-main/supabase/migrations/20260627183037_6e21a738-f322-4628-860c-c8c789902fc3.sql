
-- =========================================================
-- ENUM + ROLES
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin');

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- USER ROLES
-- =========================================================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer role check (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =========================================================
-- TIMESTAMP TRIGGER
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- NEW-USER HANDLER: create profile + first user becomes admin
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  -- If no admin exists yet, first registered user becomes admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- PROFILES POLICIES
-- =========================================================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- USER ROLES POLICIES
-- =========================================================
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- DIARY ENTRIES
-- =========================================================
CREATE TABLE public.diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date_label text NOT NULL,                -- e.g. "Mayo 2026"
  excerpt text NOT NULL,
  body text,
  cover_image_url text,
  published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.diary_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diary_entries TO authenticated;
GRANT ALL ON public.diary_entries TO service_role;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published diary entries"
  ON public.diary_entries FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage diary entries"
  ON public.diary_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- ASTROLOGY ARTICLES
-- =========================================================
CREATE TABLE public.astrology_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL,                       -- Lunación / Tránsito / Configuración
  date_label text NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  body text,
  cover_image_url text,
  published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astrology_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.astrology_articles TO authenticated;
GRANT ALL ON public.astrology_articles TO service_role;
ALTER TABLE public.astrology_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published articles"
  ON public.astrology_articles FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage articles"
  ON public.astrology_articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_astrology_articles_updated_at
  BEFORE UPDATE ON public.astrology_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- RESOURCES (downloadable PDFs)
-- =========================================================
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,                      -- Secuencia / Plantilla / Guía / Ritual
  title text NOT NULL,
  description text NOT NULL,
  file_path text,                          -- key in storage bucket 'resource-files'
  published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published resources"
  ON public.resources FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage resources"
  ON public.resources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- SERVICES
-- =========================================================
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  num text NOT NULL,                       -- "I" "II" "III" "IV"
  title text NOT NULL,
  duration text NOT NULL,
  body text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published services"
  ON public.services FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- RESOURCE DOWNLOADS (email leads)
-- =========================================================
CREATE TABLE public.resource_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.resource_downloads TO anon, authenticated;
GRANT SELECT ON public.resource_downloads TO authenticated;
GRANT ALL ON public.resource_downloads TO service_role;
ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a download"
  ON public.resource_downloads FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view downloads"
  ON public.resource_downloads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- SEED initial content (from current static pages)
-- =========================================================
INSERT INTO public.services (num, title, duration, body, sort_order, published) VALUES
('I',   'Lectura de Carta Astral',          '90 min · online',                  'Un mapa simbólico de tu momento vital. Trabajamos juntas tu carta natal o un tránsito específico que estés atravesando.', 1, true),
('II',  'Sesión de Acompañamiento',         '60 min · online o presencial',     'Espacio de escucha terapéutica integrando herramientas del yoga, la astrología y la palabra. Para procesos abiertos.', 2, true),
('III', 'Práctica de Yoga personalizada',   '75 min · online',                  'Una secuencia diseñada a tu medida y momento. Incluye guía escrita para que puedas continuarla en casa.', 3, true),
('IV',  'Proceso Venus (3 meses)',          'Acompañamiento profundo',          'Un trayecto de tres meses que combina lectura de carta, sesiones quincenales y prácticas para casa. Plazas limitadas.', 4, true);

INSERT INTO public.diary_entries (date_label, title, excerpt, sort_order, published) VALUES
('Mayo 2026',  'Lo que el cuerpo recuerda cuando la mente olvida', 'Sobre las memorias que viven en las caderas y el modo en que la práctica las invita a salir.', 1, true),
('Abril 2026', 'Habitar la espera',                                 'Una reflexión sobre los tiempos lentos, los procesos sin nombre y la fertilidad de no saber.',   2, true),
('Marzo 2026', 'El altar pequeño',                                  'Por qué importa tener un rincón propio donde la vida cotidiana se vuelve sagrada.',              3, true);

INSERT INTO public.astrology_articles (tag, date_label, title, excerpt, sort_order, published) VALUES
('Lunación',      '10 Jun 2026',  'Luna llena en Sagitario: el arco que apunta lejos',  'Análisis técnico del plenilunio, aspectos en juego y casas activadas según ascendente.', 1, true),
('Tránsito',      'Junio 2026',   'Venus en Cáncer: el regreso al hogar afectivo',      'Qué moviliza el tránsito de Venus por el signo del agua, casa por casa.',              2, true),
('Configuración', 'Mayo 2026',    'Cuadratura Saturno – Urano: estructuras que crujen', 'Lectura técnica de la cuadratura y cómo se vive desde los signos fijos.',              3, true);

INSERT INTO public.resources (type, title, description, sort_order, published) VALUES
('Secuencia', 'Yoga para abrir caderas',         'Práctica de 30 minutos con foco en caderas y suelo pélvico. PDF con fotos.',        1, true),
('Plantilla', 'Diario de luna nueva',            'Plantilla imprimible para registrar intenciones en cada lunación.',                 2, true),
('Guía',      'Tu carta natal, primer mapa',     'Pequeña guía introductoria para leer los símbolos básicos de tu carta.',            3, true),
('Ritual',    'Práctica de Venus en Tauro',      'Secuencia corta de yoga + ritual sensorial para activar el cuerpo de placer.',     4, true);
