-- Landing de Venus App. active = false muestra «Próximamente».
INSERT INTO public.site_sections (id, active) VALUES ('app', true)
ON CONFLICT (id) DO NOTHING;
