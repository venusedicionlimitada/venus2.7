-- Recursos: precio, Stripe, activación, portada y campos que el admin ya enviaba.
-- published = se pinta en /recursos
-- active = el botón funciona; si está publicado y no active, se ve «Próximamente»

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS tags text,
  ADD COLUMN IF NOT EXISTS categoria_emocional text;
