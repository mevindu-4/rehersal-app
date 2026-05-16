# Rehearsal — Full API Specification

For **Member 1 (Platform)**. All routes under `app/api/`. Validate with Zod from `lib/schemas.ts`. Types from `types/index.ts`.

**Auth:** Every route calls `requireAuth()` unless noted. Check org via `memberships`.

**Errors:** `{ "error": "message", "code": "OPTIONAL" }` with HTTP 4xx/5xx.

**Never return:** API keys, service role tokens.

---

## Auth

### `GET|POST /api/auth/callback`

Supabase OAuth / magic link exchange. Redirect to `/dashboard` or `/onboarding` if new user.

Also: `app/(auth)/callback/route.ts` for App Router session cookies.

---

## Targets

### `GET /api/targets`

**Query:** `?status=complete&domain=fundraising` (optional)

**Response 200:**
```json
{
  "targets": [
    {
      "id": "uuid",
      "org_id": "uuid",
      "name": "Jane Smith",
      "title": "VP Engineering",
      "company": "Acme",
      "domain": "interview",
      "status": "complete",
      "source_count": 3,
      "session_count": 2,
      "accuracy_rating": 4.2,
      "personality_json": { }
    }
  ]
}
```

### `POST /api/targets`

**Body** (`CreateTargetSchema`):
```json
{
  "name": "Jane Smith",
  "title": "VP Engineering",
  "company": "Acme Corp",
  "domain": "interview",
  "tags": ["faang", "behavioral"]
}
```

**Response 201:**
```json
{ "target": { "id": "uuid", "status": "pending", "...": "..." } }
```

### `GET /api/targets/[id]`

**Response 200:** `{ "target": TargetProfile, "sources": TargetSource[] }`

### `PATCH /api/targets/[id]`

**Body** (`UpdateTargetSchema`): partial fields including `personality_json`, `avatar_brief_template`

**Response 200:** `{ "target": TargetProfile }`

### `DELETE /api/targets/[id]`

**Response 204**

### `POST /api/targets/[id]/sources`

**Body** (`AddSourceSchema`):
```json
{ "source_type": "url", "url": "https://example.com/article", "title": "Blog post" }
```
```json
{ "source_type": "manual", "manual_text": "She always opens with...", "title": "Notes" }
```
```json
{ "source_type": "document", "document_id": "uuid" }
```

**Response 201:** `{ "source": TargetSource }`

### `POST /api/targets/[id]/reconstruct`

**Body:** `{}` (optional)

**Response 202:** `{ "message": "Reconstruction started", "target_id": "uuid" }`

Async: runs `reconstructTarget()`. Client polls target until `status` is `complete` or `failed`.

### `GET /api/targets/[id]/preview`

**Response 200:**
```json
{
  "avatar_brief": "Plain-English 3-4 sentence preview...",
  "system_prompt_preview": "Full prompt preview (coach-only optional)"
}
```

---

## Documents

### `GET /api/documents`

**Query:** `?doc_type=my_background&embedding_status=complete`

**Response 200:** `{ "documents": UserDocument[] }`

### `POST /api/documents/upload` (recommended)

**Content-Type:** `multipart/form-data`

| Field | Required | Description |
|-------|----------|-------------|
| `file` | yes | PDF, DOCX, or TXT (max 50MB) |
| `doc_type` | yes | `my_background`, `opportunity`, etc. |
| `is_company_shared` | no | `true` for team company docs (owner only) |

Server uploads to Storage `documents` bucket, extracts text, creates row, starts embedding async.

**Response 201:** `{ "document": UserDocument }`

---

### `POST /api/documents`

**Content-Type:** JSON (when file already in Storage):

```json
{
  "filename": "resume.pdf",
  "file_url": "https://xxx.supabase.co/storage/v1/object/...",
  "file_size_bytes": 245000,
  "file_type": "pdf",
  "doc_type": "my_background",
  "is_company_shared": false
}
```

**Server:** extract text → chunk → embed → update `embedding_status`

**Response 201:** `{ "document": UserDocument }`

### `DELETE /api/documents/[id]`

**Response 204** — also delete chunks

### `POST /api/documents/embed`

**Body:** `{ "document_id": "uuid" }` optional — if omitted, re-embed all pending

**Response 202:** `{ "message": "Embedding started" }`

---

## Company documents (Team)

### `GET /api/company-documents`

Same shape as documents where `is_company_shared = true`. Any org member.

### `POST /api/company-documents`

**Auth:** `requireRole(['owner'])`  
Same body as `POST /api/documents` with `is_company_shared: true`

### `DELETE /api/company-documents/[id]`

**Auth:** owner only

---

## Scenarios

### `GET /api/scenarios`

**Response 200:** `{ "scenarios": Scenario[] }` (include target name via join optional)

### `POST /api/scenarios`

**Body** (`ScenarioConfigSchema`):
```json
{
  "title": "Series A pitch rehearsal",
  "conversation_type": "fundraising_pitch",
  "target_profile_id": "uuid",
  "duration_minutes": 15,
  "difficulty": 4,
  "goal": "Secure follow-up meeting and address unit economics concerns",
  "included_document_ids": ["uuid", "uuid"],
  "is_template": false
}
```

**Response 201:** `{ "scenario": Scenario }`

### `GET|PATCH|DELETE /api/scenarios/[id]`

Standard CRUD. PATCH uses partial `ScenarioConfigSchema` fields.

---

## Sessions

### `GET /api/sessions`

**Query:** `?status=report_ready&limit=20&user_id=` (coach may filter learners)

**Response 200:** `{ "sessions": SessionHistoryItem[] }`

### `POST /api/sessions`

**Body** (`CreateSessionSchema`):
```json
{
  "scenario_id": "uuid",
  "assignment_id": "uuid"
}
```

**Server flow:**
1. Load scenario, target, documents  
2. `contextRetriever(scenario.goal)` → top 5 chunks  
3. `avatarBriefBuilder(...)` → system prompt string  
4. Insert session `status: created`  
5. `beyondPresence.createCall({ agentId, userName, systemPromptOverride, tags })`  
6. Update session: `bey_call_id`, `join_url`, `system_prompt_used`, `status: ready`  

**Response 201:**
```json
{
  "session": { "id": "uuid", "status": "ready", "..." : "..." },
  "join_url": "https://..."
}
```

**Never include:** `BEY_API_KEY`, full system prompt in client unless preview feature.

### `GET /api/sessions/[id]`

**Response 200:**
```json
{
  "session": Session,
  "scenario": Scenario,
  "target": TargetProfile,
  "turns": SessionTurn[]
}
```

### `POST /api/sessions/[id]/end`

**Body:** `{}`

**Server:**
1. `ended_at = now()`, `duration_seconds`  
2. `getCallMessages(bey_call_id)` → insert `session_turns`  
3. `status: evaluating`  
4. Fire-and-forget `evaluateSession(id)`  
5. Return **202**

**Response 202:** `{ "session_id": "uuid", "status": "evaluating" }`

### `POST /api/sessions/[id]/sync-messages`

Manual transcript pull from BP. Same turn insertion logic.

**Response 200:** `{ "turns_count": 42 }`

### `POST /api/sessions/[id]/evaluate`

**Response 202:** `{ "message": "Evaluation started" }`

Runs `evaluator` → `reportBuilder` → `session.status = report_ready`

---

## Reports

Report `id` = `feedback_reports.id` (or use `session_id` lookup — document which in implementation).

### `GET /api/reports/[id]`

**Response 200:**
```json
{
  "report": {
    "id": "uuid",
    "session_id": "uuid",
    "report_json": {
      "executive_summary": "...",
      "overall_score": 72,
      "target_fit_score": 68,
      "conversation_type": "fundraising_pitch",
      "target_name": "The Contrarian Seed VC",
      "session_date": "2026-05-16T14:30:00Z",
      "best_moments": [
        {
          "timestamp": "04:12",
          "user_said": "Our CAC payback is 11 months...",
          "reason": "Specific metric matched their data-driven bias"
        }
      ],
      "weak_moments": [],
      "missed_signals": [],
      "suggested_answers": [],
      "communication_notes": {
        "filler_words_count": 12,
        "directness": 7,
        "structure": 6,
        "clarity": 8
      }
    },
    "pdf_url": null
  },
  "evaluation": { "overall_score": 72, "target_fit_score": 68 },
  "coach_comments": []
}
```

### `POST /api/reports/[id]/pdf`

**Response 200:** `{ "pdf_url": "https://signed-url..." }`

### `POST /api/reports/[id]/rate-accuracy`

**Body** (`RateAccuracySchema`):
```json
{
  "accuracy_score": 4,
  "feedback_text": "Voice was close but pacing was fast"
}
```

**Response 201:** `{ "rating": AccuracyRating }`

---

## Library

### `GET /api/library`

**Query:** `category=professional&domain=fundraising&search=vc&sort=most_used&featured=true`

**Response 200:** `{ "profiles": LibraryProfile[], "total": 15 }`

### `GET /api/library/[id]`

**Response 200:** `{ "profile": LibraryProfile }`

### `POST /api/library/[id]/clone`

**Response 201:**
```json
{
  "target": {
    "id": "new-uuid",
    "name": "The Contrarian Seed VC",
    "is_library": true,
    "status": "complete"
  }
}
```

Copies `profile_json` + `avatar_brief_template` into `target_profiles`.

---

## Admin (coach / owner)

### `GET /api/admin/sessions`

**Query:** `?from=2026-05-01&learner_id=`

**Response 200:** `{ "sessions": SessionHistoryItem[] }`

### `GET /api/admin/team-report`

**Response 200:**
```json
{
  "sessions_this_week": 24,
  "avg_team_score": 71,
  "skill_gaps": [
    { "dimension": "Structure", "avg": 62 },
    { "dimension": "Evidence Quality", "avg": 58 }
  ],
  "members": [
    {
      "user_id": "uuid",
      "name": "Alex",
      "sessions_count": 5,
      "avg_score": 74,
      "last_active": "2026-05-15"
    }
  ]
}
```

---

## Assignments

### `GET /api/assignments`

**Response:** `{ "assignments": Assignment[] }` — coach sees all; learner sees own

### `POST /api/assignments`

**Auth:** coach+  
**Body** (`CreateAssignmentSchema`):
```json
{
  "learner_ids": ["uuid", "uuid"],
  "scenario_id": "uuid",
  "due_date": "2026-05-20T23:59:59Z",
  "message": "Focus on handling objections"
}
```

**Response 201:** `{ "assignments": Assignment[] }`

---

## Coach comments

### `POST /api/coach-comments`

**Body** (`CoachCommentSchema`):
```json
{
  "report_id": "uuid",
  "session_id": "uuid",
  "turn_sequence": 14,
  "comment_text": "Strong opening — push harder on metrics here"
}
```

**Response 201:** `{ "comment": CoachComment }`

---

## Webhooks

### `POST /api/webhooks/beyond-presence`

Verify signature if BP provides. Handle call ended / message events. Update session status as needed.

---

## Rate limits

Apply on: `reconstruct`, `embed`, `POST sessions`, `evaluate`, `pdf`.

Return **429:** `{ "error": "Rate limit exceeded" }`

---

## Status codes summary

| Code | When |
|------|------|
| 200 | OK |
| 201 | Created |
| 202 | Async job started |
| 204 | Deleted |
| 400 | Zod validation fail |
| 401 | Not authenticated |
| 403 | Wrong role / org |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error (log to Sentry) |

---

## Quick reference

See [API_SPEC.md](./API_SPEC.md) for route table only. This document is the **source of truth** for request/response shapes.
