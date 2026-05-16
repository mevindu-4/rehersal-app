# Rehearsal — Database Schema Reference

Migrations live in `supabase/migrations/`. Run in order: `001` → `004`.

## Tables (19)

| Table | Purpose |
|-------|---------|
| `organizations` | Workspace (solo/team), slug, avatar minutes |
| `users` | Profile linked to `auth.users` |
| `memberships` | User ↔ org with role |
| `target_profiles` | Reconstructed persona |
| `target_sources` | URL / document / manual inputs |
| `user_documents` | User uploads + embedding status |
| `document_chunks` | Chunked text + vector(1536) |
| `scenarios` | Session configuration |
| `sessions` | Live BP call state |
| `session_turns` | Transcript lines |
| `evaluations` | AI scores (1 per session) |
| `feedback_reports` | Full report JSON |
| `accuracy_ratings` | User 1–5 rating |
| `assignments` | Coach → learner tasks |
| `coach_comments` | Coach notes on reports |
| `public_figure_library` | Cloneable archetypes |
| `usage_events` | Analytics events |
| `audit_logs` | Admin audit trail |

## Key Enums

**organizations.mode:** `solo` | `team`  
**memberships.role:** `owner` | `coach` | `learner` | `reviewer`  
**target_profiles.domain:** `interview` | `fundraising` | `sales` | `negotiation` | `personal` | `other`  
**target_profiles.status:** `pending` | `reconstructing` | `complete` | `failed`  
**scenarios.conversation_type:** `job_interview` | `fundraising_pitch` | `sales_discovery` | `difficult_conversation` | `negotiation` | `deposition` | `media_interview` | `board_meeting` | `personal_conversation` | `custom`  
**sessions.status:** `created` | `ready` | `live` | `ended` | `evaluating` | `report_ready` | `failed`  

## RLS Summary (002)

- Users CRUD only rows where `org_id` ∈ their memberships  
- Service role bypasses RLS (API routes)  
- `public_figure_library`: SELECT for any authenticated user  
- Owner/coach: read all org rows  
- Learner: own sessions, reports, assignments only  

## pgvector (003)

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX document_chunks_embedding_idx ON document_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

## Indexes (004)

- `sessions(user_id)`, `sessions(org_id)`, `sessions(status)`  
- `target_profiles(org_id)`  
- `assignments(learner_id)`, `assignments(status)`  
- `target_sources(target_profile_id)`  
- `document_chunks(user_document_id)`  

## Personality JSON Shape

Stored in `target_profiles.personality_json`. Validated by `PersonalityJSONSchema` in `lib/schemas.ts`.

Fields: `communication_style`, `core_values`, `typical_question_patterns`, `known_priorities`, `known_skepticisms`, `what_impresses_them`, `what_irritates_them`, `expertise_areas`, `behavioral_signals`, `inferred_concerns_by_context`, `source_citations`, `confidence`.

See [PROMPTS.md](./PROMPTS.md) for reconstruction output rules.
