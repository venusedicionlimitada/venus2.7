-- Mensajes del formulario de contacto.
-- Cualquiera puede enviar (vía función). Solo un admin lee, cambia el estado o borra.

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text NOT NULL,
  motivo text NOT NULL,
  mensaje text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'leido', 'contestado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.submit_contact_message(
  p_nombre text,
  p_email text,
  p_motivo text,
  p_mensaje text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF char_length(btrim(p_nombre)) NOT BETWEEN 1 AND 200
     OR char_length(btrim(p_email)) NOT BETWEEN 3 AND 320
     OR position('@' IN p_email) = 0
     OR char_length(btrim(p_motivo)) NOT BETWEEN 1 AND 200
     OR char_length(btrim(p_mensaje)) NOT BETWEEN 1 AND 5000
  THEN
    RAISE EXCEPTION 'invalid contact message';
  END IF;

  INSERT INTO public.contact_messages (nombre, email, motivo, mensaje)
  VALUES (btrim(p_nombre), btrim(p_email), btrim(p_motivo), btrim(p_mensaje));
END;
$$;

REVOKE ALL ON FUNCTION public.submit_contact_message(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_contact_message(text, text, text, text) TO anon, authenticated;
