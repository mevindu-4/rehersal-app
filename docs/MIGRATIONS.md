# Rehearsal — Database Migrations Guide

## Run Order

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_pgvector_setup.sql
supabase/migrations/004_seed_indexes.sql
supabase/migrations/005_audit_logs_and_columns.sql
supabase/migrations/006_repair_library_and_rpc.sql
supabase/migrations/007_fix_public_figure_library.sql
supabase/migrations/008_storage_buckets.sql
supabase/migrations/009_library_id_text.sql
```

**Do NOT** insert seed data in migrations. Use `scripts/seed-library.ts` and `scripts/seed-demo.ts` after.

---

## 001 — Initial Schema

Create **19 tables** with enums, FKs, defaults:

1. `organizations` — includes `plan text default 'free'`  
2. `users` — `id` references `auth.users`  
3. `memberships` — unique `(org_id, user_id)`  
4. `target_profiles` — includes `error_message text`  
5. `target_sources`  
6. `user_documents`  
7. `document_chunks` — `embedding vector(1536)` (column only; index in 003)  
8. `scenarios` — 10 `conversation_type` values  
9. `sessions`  
10. `session_turns` — index `(session_id, sequence)`  
11. `evaluations` — unique `session_id`  
12. `feedback_reports` — unique `session_id`  
13. `accuracy_ratings`  
14. `assignments`  
15. `coach_comments`  
16. `public_figure_library` — `id text` PK  
17. `usage_events`  
18. `audit_logs`  

Use `gen_random_uuid()` for UUID PKs. Use `timestamptz` with `default now()` for timestamps.

---

## 002 — RLS Policies

```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
```

**Policies per table:**

| Pattern | Rule |
|---------|------|
| Org-scoped tables | `org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())` |
| `users` | User can read/update own row |
| `memberships` | Members can read org memberships; owners manage |
| `public_figure_library` | `authenticated` can SELECT |
| Learner restrictions | Sessions/reports/assignments: `user_id = auth.uid()` for learners |
| Coach/owner | Broader SELECT on org sessions for admin routes |

Service role key bypasses RLS when used from API routes.

---

## 003 — pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX document_chunks_embedding_idx ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

Run **after** `document_chunks` table exists. Do not create ivfflat before extension.

---

## 004 — Seed Indexes

```sql
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_org_id ON sessions(org_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_target_profiles_org_id ON target_profiles(org_id);
CREATE INDEX idx_assignments_learner_id ON assignments(learner_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_target_sources_target_profile_id ON target_sources(target_profile_id);
CREATE INDEX idx_document_chunks_user_document_id ON document_chunks(user_document_id);
```

---

## Verification

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

Expected: 19 tables, RLS enabled on each, vector extension active.
