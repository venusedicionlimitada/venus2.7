-- El texto de la tarjeta pasa a llamarse extracto.
-- descripcion queda para el panel, y empieza vacía: lo ya escrito era el texto de la tarjeta.

ALTER TABLE public.emociones ADD COLUMN IF NOT EXISTS extracto text;

UPDATE public.emociones
SET extracto = descripcion
WHERE (extracto IS NULL OR btrim(extracto) = '')
  AND descripcion IS NOT NULL
  AND btrim(descripcion) <> '';

UPDATE public.emociones
SET descripcion = NULL
WHERE extracto IS NOT NULL
  AND descripcion IS NOT NULL
  AND descripcion = extracto;
