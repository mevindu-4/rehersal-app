-- =============================================================================
-- Run this in Supabase → SQL Editor (fixes verify:supabase failures)
-- Combines migrations 007 + 008
-- =============================================================================

-- ─── 007: public_figure_library columns ─────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE library_category AS ENUM ('professional', 'personal', 'real_figure');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE target_domain AS ENUM (
    'interview', 'fundraising', 'sales', 'negotiation', 'personal', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS category library_category NOT NULL DEFAULT 'professional';

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS company TEXT;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS domain target_domain NOT NULL DEFAULT 'other';

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS profile_json JSONB;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS avatar_brief_template TEXT;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS source_urls TEXT[] DEFAULT '{}';

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS usage_count INT NOT NULL DEFAULT 0;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS accuracy_rating NUMERIC;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS moderation_status moderation_status NOT NULL DEFAULT 'approved';

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES users(id) ON DELETE SET NULL;

UPDATE public_figure_library
SET
  name = COALESCE(name, id),
  category = COALESCE(category, 'professional'::library_category),
  avatar_brief_template = COALESCE(avatar_brief_template, 'Library profile'),
  tags = COALESCE(tags, '{}'),
  source_urls = COALESCE(source_urls, '{}'),
  profile_json = COALESCE(profile_json, '{}'::jsonb),
  is_featured = COALESCE(is_featured, false)
WHERE name IS NULL
   OR category IS NULL
   OR avatar_brief_template IS NULL
   OR profile_json IS NULL;

-- ─── 008: storage buckets ───────────────────────────────────────────────────

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
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can read public documents"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'documents');

CREATE POLICY "Users can delete own document files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents');

CREATE POLICY "Service role manages reports bucket"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'reports') WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Authenticated can read reports"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'reports');
