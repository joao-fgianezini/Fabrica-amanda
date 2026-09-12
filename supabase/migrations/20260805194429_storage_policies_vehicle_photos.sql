-- Allow authenticated users to upload/manage vehicle photos
CREATE POLICY "authenticated_upload_photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-photos');

CREATE POLICY "authenticated_read_photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'vehicle-photos');

CREATE POLICY "authenticated_delete_photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-photos');
