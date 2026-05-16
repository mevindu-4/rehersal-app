-- Migration 008: Storage buckets + policies (idempotent)
-- Run in Supabase SQL Editor after 001–007

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'documents',
    'documents',
    true,
    52428800,
    ARRAY[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  ),
  ('reports', 'reports', false, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read public documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own document files" ON storage.objects;
DROP POLICY IF EXISTS "Service role manages reports bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can read reports" ON storage.objects;

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can read public documents"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'documents');

CREATE POLICY "Users can delete own document files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Service role manages reports bucket"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'reports')
  WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Authenticated can read reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'reports');
