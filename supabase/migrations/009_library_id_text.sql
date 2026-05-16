-- Migration 009: public_figure_library.id must be TEXT (lib_* slugs from JSON seed)
-- Run after 007. Safe when table is empty or only has UUID placeholders.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'public_figure_library'
      AND column_name = 'id'
      AND udt_name = 'uuid'
  ) THEN
    ALTER TABLE public_figure_library
      ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;
END $$;
