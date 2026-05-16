-- Migration 006: Repair schema drift + pgvector RPC
-- Safe to re-run (idempotent). Run in Supabase SQL Editor AFTER 001–005.
--
-- Fixes:
--   - user_documents.is_company_shared (required by match_document_chunks)
--   - public_figure_library.avatar_brief_template (required by seed-library)
--   - match_document_chunks RPC (required by context retrieval)

-- ─── user_documents (add missing columns from 001) ───────────────────────────

ALTER TABLE user_documents
  ADD COLUMN IF NOT EXISTS extracted_text TEXT;

ALTER TABLE user_documents
  ADD COLUMN IF NOT EXISTS is_company_shared BOOLEAN NOT NULL DEFAULT false;

-- Only if doc_type enum exists (from 001)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doc_type') THEN
    ALTER TABLE user_documents
      ADD COLUMN IF NOT EXISTS doc_type doc_type NOT NULL DEFAULT 'other';
  END IF;
END $$;

-- Only if embedding_status enum exists (from 001)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'embedding_status') THEN
    ALTER TABLE user_documents
      ADD COLUMN IF NOT EXISTS embedding_status embedding_status NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- ─── public_figure_library (add missing columns from 001) ────────────────────

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS avatar_brief_template TEXT;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS profile_json JSONB;

ALTER TABLE public_figure_library
  ADD COLUMN IF NOT EXISTS source_urls TEXT[] DEFAULT '{}';

UPDATE public_figure_library
SET avatar_brief_template = 'Library profile'
WHERE avatar_brief_template IS NULL;

-- ─── pgvector (from 003) ─────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Ivfflat index: skip if table empty (optional); create when embeddings exist
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ─── Semantic search RPC (must run AFTER is_company_shared exists) ───────────

CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_count INT DEFAULT 5,
  filter_org_id UUID DEFAULT NULL,
  filter_user_id UUID DEFAULT NULL,
  include_company BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  user_document_id UUID,
  chunk_text TEXT,
  chunk_index INT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.id,
    dc.user_document_id,
    dc.chunk_text,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN user_documents ud ON ud.id = dc.user_document_id
  WHERE dc.embedding IS NOT NULL
    AND (filter_org_id IS NULL OR ud.org_id = filter_org_id)
    AND (
      ud.user_id = filter_user_id
      OR (include_company AND COALESCE(ud.is_company_shared, false) = true)
    )
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;
