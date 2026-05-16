# Rehearsal — API Route Index

Quick reference. **Full request/response examples:** [API_SPEC_FULL.md](./API_SPEC_FULL.md)

All routes: `app/api/`. Validate with `lib/schemas.ts`. Auth via `lib/auth.ts`.

---

## Auth

| Method | Path |
|--------|------|
| GET/POST | `/api/auth/callback` |

## Targets

| Method | Path |
|--------|------|
| GET, POST | `/api/targets` |
| GET, PATCH, DELETE | `/api/targets/[id]` |
| POST | `/api/targets/[id]/sources` |
| POST | `/api/targets/[id]/reconstruct` |
| GET | `/api/targets/[id]/preview` |

## Documents

| Method | Path |
|--------|------|
| GET, POST | `/api/documents` |
| POST | `/api/documents/upload` — multipart: `file`, `doc_type`, optional `is_company_shared` |
| DELETE | `/api/documents/[id]` |
| POST | `/api/documents/embed` |

## Company documents

| Method | Path |
|--------|------|
| GET, POST | `/api/company-documents` |
| DELETE | `/api/company-documents/[id]` |

## Scenarios

| Method | Path |
|--------|------|
| GET, POST | `/api/scenarios` |
| GET, PATCH, DELETE | `/api/scenarios/[id]` |

## Sessions

| Method | Path |
|--------|------|
| GET, POST | `/api/sessions` |
| GET | `/api/sessions/[id]` |
| POST | `/api/sessions/[id]/end` |
| POST | `/api/sessions/[id]/sync-messages` |
| POST | `/api/sessions/[id]/evaluate` |

## Reports

| Method | Path |
|--------|------|
| GET | `/api/reports/[id]` |
| POST | `/api/reports/[id]/pdf` |
| POST | `/api/reports/[id]/rate-accuracy` |

## Library

| Method | Path |
|--------|------|
| GET | `/api/library` |
| GET | `/api/library/[id]` |
| POST | `/api/library/[id]/clone` |

## Team

| Method | Path |
|--------|------|
| GET | `/api/admin/sessions` |
| GET | `/api/admin/team-report` |
| GET | `/api/team/members` |
| GET, POST | `/api/assignments` |
| POST | `/api/coach-comments` |

## Settings

| Method | Path |
|--------|------|
| GET | `/api/settings/export` — owner only, JSON download |

## Webhooks

| Method | Path |
|--------|------|
| POST | `/api/webhooks/beyond-presence` |
