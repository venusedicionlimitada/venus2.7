-- active = el enlace funciona.
-- published y no active: el contenido se ve, pero el botón dice «Próximamente» y no abre página.

ALTER TABLE public.diary_entries
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

ALTER TABLE public.astrology_articles
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

ALTER TABLE public.yoga_articles
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

ALTER TABLE public.lunar_events
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
