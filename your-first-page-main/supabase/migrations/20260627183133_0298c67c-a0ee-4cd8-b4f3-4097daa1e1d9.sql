
CREATE POLICY "Admins manage content-images"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage resource-files"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'resource-files' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'resource-files' AND public.has_role(auth.uid(), 'admin'));
