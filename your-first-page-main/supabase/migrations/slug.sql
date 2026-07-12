
CREATE OR REPLACE FUNCTION public.slugify(v TEXT) RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE r TEXT;
BEGIN
  r := lower(coalesce(v,''));
  r := translate(r,
    'áàäâãåéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÅÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
    'aaaaaaeeeeiiiioooooouuuuncAAAAAAEEEEIIIIOOOOOUUUUNC');
  r := regexp_replace(r, '[^a-z0-9]+', '-', 'g');
  r := regexp_replace(r, '(^-+|-+$)', '', 'g');
  IF r = '' THEN r := 'entrada'; END IF;
  RETURN r;
END $$;

ALTER TABLE public.diary_entries ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.astrology_articles ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill unique slugs
WITH numbered AS (
  SELECT id, public.slugify(title) AS base,
         row_number() OVER (PARTITION BY public.slugify(title) ORDER BY created_at) AS rn
  FROM public.diary_entries WHERE slug IS NULL OR slug = ''
)
UPDATE public.diary_entries d SET slug = CASE WHEN n.rn = 1 THEN n.base ELSE n.base || '-' || n.rn END
FROM numbered n WHERE d.id = n.id;

WITH numbered AS (
  SELECT id, public.slugify(title) AS base,
         row_number() OVER (PARTITION BY public.slugify(title) ORDER BY created_at) AS rn
  FROM public.astrology_articles WHERE slug IS NULL OR slug = ''
)
UPDATE public.astrology_articles a SET slug = CASE WHEN n.rn = 1 THEN n.base ELSE n.base || '-' || n.rn END
FROM numbered n WHERE a.id = n.id;

ALTER TABLE public.diary_entries ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.astrology_articles ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS diary_entries_slug_key ON public.diary_entries(slug);
CREATE UNIQUE INDEX IF NOT EXISTS astrology_articles_slug_key ON public.astrology_articles(slug);
