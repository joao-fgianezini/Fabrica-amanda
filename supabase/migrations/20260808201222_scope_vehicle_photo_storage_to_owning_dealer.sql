/*
  # Scope vehicle photo storage to the owning dealership

  1. Problem
     - The upload and delete policies on the `vehicle-photos` bucket checked only
       `bucket_id`, so any signed-in dealer could delete or overwrite every other
       dealership's photos and logos.
     - The bucket had no MIME type or size restriction, so any file of any size
       could be published on the project's public storage origin.

  2. Changes
     - Upload and delete now require the first path segment to be a dealership the
       caller owns. The app already writes `<dealer_id>/...` keys, so existing
       behaviour is preserved for legitimate users.
     - The bucket is limited to image types and 10 MB per file.

  3. Notes
     - Read access stays open because listings are public by design.
*/

DROP POLICY IF EXISTS "authenticated_upload_photos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_photos" ON storage.objects;

CREATE POLICY "dealer_upload_own_photos" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vehicle-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT d.id::text FROM dealers d WHERE d.user_id = auth.uid()
    )
  );

CREATE POLICY "dealer_delete_own_photos" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vehicle-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT d.id::text FROM dealers d WHERE d.user_id = auth.uid()
    )
  );

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
WHERE id = 'vehicle-photos';
