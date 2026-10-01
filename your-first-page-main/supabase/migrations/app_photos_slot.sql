-- Separa las capturas del marco «Así responde Venus» de las de «Tu carta, o la de dos».
-- Las filas que ya existen siguen en el primer marco.

ALTER TABLE public.app_photos
  ADD COLUMN IF NOT EXISTS slot text NOT NULL DEFAULT 'responde';

ALTER TABLE public.app_photos
  DROP CONSTRAINT IF EXISTS app_photos_slot_check;

ALTER TABLE public.app_photos
  ADD CONSTRAINT app_photos_slot_check CHECK (slot IN ('responde', 'carta'));
