# Rehearsal — Project Audit & Fix Tracker (v2, post-merge)

**Audited against:** Full Rehearsal spec (Parts 1–17)  
**Date:** 2026-05-16  
**Branch:** `main`  
**Git status:** Frontend integrated — see `docs/STATUS.md` for live checklist

---

## Phase Status Summary

| Phase | Description | Status |
|-------|-------------|--------|
| A — Foundation | Next.js, Supabase, migrations, types, schemas, lib modules | ✅ Complete |
| B — Auth + Onboarding | Sign-in, callback, onboarding flow, app shell | ✅ Complete — enable Google in Supabase for production |
| C — Target Builder | Builder steps, scraper, reconstruction, API routes | ✅ UI + API — verify E2E with OpenAI |
| D — Documents + Context Engine | Upload, embedding, retrieval, API routes | ✅ UI + API — verify embed pipeline |
| E — Scenarios + Avatar Brief | Configurator, prompts, API routes | ✅ UI + API |
| F — Live Session | BP integration, session UI, end flow | ✅ UI + API — verify live BP call |
| G — Evaluation + Report | Evaluator, report builder, report UI | ✅ UI + API — verify post-session eval |
| H — Progress + History | Progress dashboard, charts, history | ✅ UI — verify with session data |
| I — Public Figure Library | Library browser, 15 JSON profiles | ✅ 15 JSON + UI — run `npm run seed:library` |
| J — Team Features | Coach dashboard, admin, assignments | ✅ UI + API |
| K — Settings | Solo + team settings pages | ✅ UI + API |
| L — Polish | Skeletons, errors, mobile, rate limiting | ❌ Not started |
| M — Safety + Final QA | Safety audit, E2E testing, demo workspace | ❌ Not started |

---

## CRITICAL Issues — Blocking Users from Using the App

### C1. Frontend Pages — 17 of 18 Missing

**Present (3 total):**
- `app/(auth)/signin/page.tsx` ✅
- `app/(auth)/onboarding/page.tsx` ✅ *(resolved since v1)*
- `app/(app)/dashboard/page.tsx` ✅ *(placeholder only)*

**Missing — 17 pages to create:**

```
app/(app)/targets/page.tsx
app/(app)/targets/new/page.tsx
app/(app)/targets/[id]/page.tsx
app/(app)/targets/[id]/edit/page.tsx
app/(app)/documents/page.tsx
app/(app)/company-documents/page.tsx
app/(app)/scenarios/page.tsx
app/(app)/scenarios/new/page.tsx
app/(app)/scenarios/[id]/page.tsx
app/(app)/sessions/[id]/page.tsx
app/(app)/reports/[id]/page.tsx
app/(app)/library/page.tsx
app/(app)/library/[id]/page.tsx
app/(app)/progress/page.tsx
app/(app)/assignments/page.tsx
app/(app)/admin/page.tsx
app/(app)/settings/page.tsx
```

**Build order (dependency chain — do not skip):**
1. Shared components first (Sidebar, AppShell, EmptyState, LoadingSkeleton)
2. Update `app/(app)/layout.tsx` to use real Sidebar + AppShell
3. Target pages (depend on TargetBuilder components)
4. Documents, Scenarios pages
5. Session page (depends on LiveSessionPanel, SessionEmbed)
6. Report page (depends on FeedbackReport, ScoreGauge, KeyMomentCard)
7. Progress, Library, Assignments, Admin, Settings pages

---

### C2. UI Components — 40+ of 42 Missing

**Present (2 total):**
- `components/providers.tsx` ✅
- `components/ui/button.tsx` ✅

**Missing by folder — create in this order:**

**`/components/shared/`** ← build first, everything depends on these
```
Sidebar.tsx
AppShell.tsx
EmptyState.tsx
LoadingSkeleton.tsx
ErrorBoundary.tsx
ConfirmDialog.tsx
OnboardingFlow.tsx
```

**`/components/targets/`**
```
TargetBuilder.tsx
TargetBuilderStep1.tsx       (Basics: name, title, company, domain)
TargetBuilderStep2.tsx       (Sources: URL / Document / Describe tabs)
TargetBuilderStep3.tsx       (Reconstruction progress, 3-sec polling)
TargetBuilderStep4.tsx       (Review profile)
PersonalityProfileCard.tsx
SourceManager.tsx
TargetCard.tsx
```

**`/components/documents/`**
```
DocumentUploader.tsx
DocumentList.tsx
DocumentTypeSelector.tsx
```

**`/components/scenarios/`**
```
ScenarioConfigurator.tsx
ConversationTypePicker.tsx
DifficultySlider.tsx
AvatarBriefPreview.tsx
ScenarioCard.tsx
```

**`/components/sessions/`**
```
PreSessionChecklist.tsx
LiveSessionPanel.tsx
SessionEmbed.tsx
GeneratingReportState.tsx
```

**`/components/reports/`**
```
FeedbackReport.tsx
ScoreGauge.tsx
ExecutiveSummary.tsx
KeyMomentCard.tsx
SuggestedAnswer.tsx
TranscriptViewer.tsx
CommunicationNotes.tsx
AccuracyRater.tsx
CoachCommentBox.tsx
```

**`/components/progress/`**
```
ProgressDashboard.tsx
ImprovementChart.tsx
SkillRadar.tsx
SessionHistoryList.tsx
StreakTracker.tsx
```

**`/components/library/`**
```
LibraryBrowser.tsx
LibraryCard.tsx
LibraryFilterTabs.tsx
LibraryDetailModal.tsx
```

**`/components/admin/`**
```
TeamPulseBand.tsx
TeamMemberTable.tsx
SkillGapChart.tsx
AssignmentManager.tsx
```

**shadcn/ui components still needed** (install via `npx shadcn@latest add <name>`):
```
input  textarea  select  checkbox  slider  badge  card  dialog  sheet
tabs  separator  avatar  skeleton  progress  toast  tooltip
dropdown-menu  command  popover  calendar
```

---

### C3. Library JSON Profiles — 14 of 15 Missing

**Present:** `public/library/contrarian-seed-vc.json` ✅

**Missing (create all 14, then run `npm run seed:library`):**
```
public/library/faang-bar-raiser.json
public/library/data-driven-series-a-vc.json
public/library/skeptical-cfo.json
public/library/probing-podcast-host.json
public/library/aggressive-cross-examiner.json
public/library/demanding-board-chair.json
public/library/empathetic-hr-partner.json
public/library/impatient-prospect.json
public/library/technical-deep-dive.json
public/library/conflict-avoidant-partner.json
public/library/direct-communicator-partner.json
public/library/defensive-partner.json
public/library/supportive-parent.json
public/library/traditional-parent.json
```

Each file must validate against `LibraryProfileSchema` in [lib/schemas.ts](lib/schemas.ts). Use `public/library/contrarian-seed-vc.json` as the template. Note: `scripts/generate-library-json.py` (Python) exists and may have been used to generate profiles — check its output before creating files from scratch.

---

## HIGH Priority — Fix Before Building Frontend

### N1. Three Duplicate Supabase Client Definitions

Three separate files create the same clients with slightly different function names:

| File | Exports | Equivalent to |
|------|---------|---------------|
| `lib/db.ts` | `createServerSupabaseClient()`, `createServiceSupabaseClient()` | (spec-correct location) |
| `lib/supabase/browser.ts` | `createBrowserSupabaseClient()` | duplicates db.ts pattern |
| `lib/supabaseAdmin.ts` | `createAdminClient()` | same as `createServiceSupabaseClient()` |

**Risk:** If a developer imports from `lib/supabaseAdmin.ts` in one file and `lib/db.ts` in another, they use different client instances. With the service role key, this is silent — no error, just inconsistency. Already happening: `app/api/documents/upload/route.ts` imports from `lib/db.ts` while other routes may import from `lib/supabaseAdmin.ts`.

**Fix:** Add `createBrowserSupabaseClient()` export to `lib/db.ts`, then delete:
- `lib/supabase/browser.ts`
- `lib/supabaseAdmin.ts`

Update all import sites to use `lib/db.ts` exclusively.

---

### N2. Auth Logic Split Across Three Files

| File | Content |
|------|---------|
| `lib/auth.ts` | Main session helpers, requireSession, requireAuth |
| `lib/auth-helpers.ts` | Additional helpers (may overlap with auth.ts) |
| `lib/auth-types.ts` | Only 8 lines — just the `AuthSession` interface |

**Spec specifies only `lib/auth.ts`.**

**Fix:**
1. Move `AuthSession` interface from `lib/auth-types.ts` → `types/index.ts`
2. Merge `lib/auth-helpers.ts` content into `lib/auth.ts`
3. Delete `lib/auth-types.ts` and `lib/auth-helpers.ts`
4. Update all import sites

---

### N3. Document Upload Route Deviates from Spec API Surface

**Spec:** `POST /api/documents` — uploads a file (multipart), returns document  
**Reality:** `POST /api/documents/upload` — the actual upload handler (139 lines, well-implemented)  
**`app/api/documents/route.ts`** — now likely handles only GET (list)

**Risk:** Frontend built to spec will call `POST /api/documents` and get back a list or 405 error instead of uploading. This is a silent contract break.

**Decision required (pick one before building frontend):**
- **Option A (spec-compliant):** Move multipart handler from `app/api/documents/upload/route.ts` into `app/api/documents/route.ts` POST handler. Delete the `/upload` sub-route.
- **Option B (keep deviation):** Keep `/api/documents/upload` as-is, but update `docs/API_SPEC.md` and all frontend components to use this URL. Add a redirect or 308 from `POST /api/documents` → `/api/documents/upload`.

---

## MEDIUM Priority — Structural Cleanup

### S1. `organizations.plan` Column Implies Billing (Excluded from MVP)

**File:** `supabase/migrations/005_audit_logs_and_columns.sql`

The `organizations.plan` column (default `'free'`) implies subscription tiers. Part 15 of the spec explicitly excludes billing/plans from MVP.

**Fix:** Either remove the column from migration 005, or add a `-- reserved for post-MVP` comment and ensure no code reads it. Do not wire it to any UI or pricing logic.

---

### S4. Python Scripts Not Executable in Node/npm Environment

| File | Type | Status |
|------|------|--------|
| `scripts/generate-library-json.py` | Python | Not runnable via npm; may have generated library JSON |
| `scripts/fix-motion.py` | Python | Purpose unclear |
| `scripts/fix-motion.js` | JavaScript (not TypeScript) | Inconsistent with project |

**Fix:** If `generate-library-json.py` was used to produce the library profiles, run it now (Python 3 required) and commit all 14 missing JSON files. Then delete the Python scripts. `fix-motion.js`/`.py` — determine if still needed; delete if not.

---

### S5. Code-Generation Scripts Not in Spec

- `scripts/generate-frontend.mjs` — programmatic frontend generator  
- `scripts/scaffold-ui.mjs` — UI scaffolding script  

These may have been intended to bootstrap component files. If they were run and produced output, check what was generated and whether it matches the spec. If not yet run, evaluate whether to use them or build manually.

**Fix:** Run `node scripts/scaffold-ui.mjs` and inspect output. Accept output that matches spec, reject/rewrite what does not. Delete scripts after use.

---

### S6. Duplicate Auth Callback Route

**Spec-correct:** `app/(auth)/callback/route.ts` (accessible at `/callback`) ✅  
**Extra:** `app/api/auth/callback/route.ts` (accessible at `/api/auth/callback`) ❌

Only one URL can be registered in Supabase Auth → Redirect URLs settings.

**Fix:** Check your Supabase dashboard → Authentication → URL Configuration → Redirect URLs. Whichever URL is registered is the active one. Delete the other route file.

---

### S7. `AGENTS.md` Exists at Both Root and `/docs/`

- `AGENTS.md` (root) — not in spec  
- `docs/AGENTS.md` — also exists (correct location per docs convention)

**Fix:** Delete `AGENTS.md` from root. Content is already in `docs/AGENTS.md`.

---

## LOW Priority — Informational / Keep As-Is

### INFO: Extra API Routes Added by Merge (Keep All)

These routes are not in spec but are required for the app to function correctly:

| Route | Why it's needed |
|-------|----------------|
| `app/api/me/route.ts` | Returns current user + org + membership — used by client hooks |
| `app/api/onboarding/route.ts` | Completes 5-step onboarding, creates org + membership |
| `app/api/settings/export/route.ts` | Data export (spec requires this in Settings, F13) |
| `app/api/team/members/route.ts` | Team member list for admin view (spec F12 requires it) |

**No action needed** — document in `docs/API_SPEC.md` if not already listed.

### INFO: Extra `lib/` Utilities Added by Merge (Keep All)

| File | Purpose |
|------|---------|
| `lib/assignments.ts` | Assignment query helpers |
| `lib/constants.ts` | Shared constants |
| `lib/libraryDbReady.ts` | Checks if library table has been seeded |
| `lib/loadLibraryProfiles.ts` | JSON fallback loader for library profiles |
| `lib/api/openaiGate.ts` | Guards endpoints when OPENAI_API_KEY is missing |
| `lib/hooks/use-api.ts` | TanStack Query React hooks |
| `lib/hooks/use-team-report.ts` | Team report hook |

**No action needed** — all are useful, none conflict with spec.

### INFO: Migration 008 Storage Buckets — Required Infrastructure

`supabase/migrations/008_storage_buckets.sql` — creates `documents` and `reports` Supabase Storage buckets. The spec relies on Storage (Part 10, F2) but omits a migration for it. This is a correct addition.

**No action needed.**

### INFO: `supabase/RUN_PENDING.sql`

Convenience file to run outstanding migrations locally. Not in spec, harmless.

---

## TYPE/SCHEMA Issues — Fix Before AI Pipelines Run

### T1. `PersonalityJSON.inferred_concerns_by_context` Will Fail Zod Validation

**Files:** `lib/schemas.ts` and `types/index.ts`

**Problem:** The Zod schema uses `z.record(ConversationTypeSchema, z.array(z.string()))` which requires OpenAI to return all 10 exact `ConversationType` enum keys. In practice, the model returns only a subset (e.g., 4–6 relevant types), causing `safeParse` to fail and reconstruction to break silently.

**Fix in `lib/schemas.ts`:**
```typescript
// Current (too strict — breaks if any key is missing):
inferred_concerns_by_context: z.record(ConversationTypeSchema, z.array(z.string())),

// Change to (accepts any string keys from AI):
inferred_concerns_by_context: z.record(z.string(), z.array(z.string())),
```

**Fix in `types/index.ts`:**
```typescript
// Current:
inferred_concerns_by_context: Record<ConversationType, string[]>;

// Change to:
inferred_concerns_by_context: Partial<Record<ConversationType, string[]>>;
```

---

### T2. Embedding Chunk Size is ~4x Too Small

**File:** `lib/embeddings.ts`

**Problem:** Spec says "512-token segments with 50-token overlap." The implementation chunks by characters (likely ~512 chars). Since 1 token ≈ 4 characters: 512 chars ≈ 128 tokens — only 25% of the target. This produces 4x more chunks than needed, each with too little context per chunk, degrading retrieval quality.

**Fix in `lib/embeddings.ts`:** Find the chunk size constants and update:
```typescript
// Change FROM whatever the current values are TO:
const CHUNK_SIZE = 2048;    // ~512 tokens
const CHUNK_OVERLAP = 200;  // ~50 tokens
```

---

## Resolved Since v1

| Issue | Resolution |
|-------|------------|
| G1 — `lib/embeddings.ts` untracked | ✅ Committed in merge |
| G2 — `.cursor/rules/project-rules.md` unstaged | ✅ Committed in merge |
| C1 — `app/(auth)/onboarding/page.tsx` missing | ✅ Now exists |

---

## Recommended Build Order (Frontend)

```
Step 1:  Fix N1 (consolidate Supabase clients into lib/db.ts)
Step 2:  Fix N2 (consolidate auth into lib/auth.ts)
Step 3:  Fix N3 (decide on /api/documents upload route)
Step 4:  Fix T1 (loosen PersonalityJSON schema)
Step 5:  Fix T2 (update chunk size in lib/embeddings.ts)
Step 6:  Install missing shadcn/ui components
Step 7:  Build /components/shared/ (Sidebar, AppShell, EmptyState, LoadingSkeleton)
Step 8:  Update app/(app)/layout.tsx to use real Sidebar + AppShell
Step 9:  Build /components/targets/ (all 8 files)
Step 10: Build app/(app)/targets/ pages (4 pages)
Step 11: Build /components/documents/ + documents pages
Step 12: Build /components/scenarios/ + scenarios pages
Step 13: Build /components/sessions/ + sessions/[id]/page.tsx
Step 14: Build /components/reports/ + reports/[id]/page.tsx
Step 15: Build /components/progress/ + progress/page.tsx
Step 16: Create 14 missing library JSON profiles → run npm run seed:library
Step 17: Build /components/library/ + library pages
Step 18: Build /components/admin/ + admin/page.tsx + assignments/page.tsx
Step 19: Build settings/page.tsx
Step 20: Fix S1 (plan column), S6 (duplicate callback), S7 (root AGENTS.md)
```
