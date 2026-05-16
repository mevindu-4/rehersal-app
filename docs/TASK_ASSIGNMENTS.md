# Rehearsal — Task Assignments for Parallel Development

Assign developers to tracks after **Critical Path (Steps 1–3)** is merged to `main`.

---

## Developer 0 — Foundation Lead (Sequential, Week 1)

**Branch:** `feat/foundation`

| # | Task | Files | Acceptance |
|---|------|-------|------------|
| 0.1 | Migration 001 — schema | `supabase/migrations/001_initial_schema.sql` | 19 tables created |
| 0.2 | Migration 002 — RLS | `002_rls_policies.sql` | RLS on all tables |
| 0.3 | Migration 003 — pgvector | `003_pgvector_setup.sql` | Extension + ivfflat index |
| 0.4 | Migration 004 — indexes | `004_seed_indexes.sql` | Query indexes exist |
| 0.5 | Types | `types/index.ts` | All tables + API types |
| 0.6 | Schemas | `lib/schemas.ts` | Zod mirrors types + AI schemas |
| 0.7 | DB clients | `lib/db.ts`, `lib/auth.ts` | 3 clients + auth helpers |

---

## Developer A — Frontend (Track A)

**Branch prefix:** `feat/ui-`

| # | Task | Files |
|---|------|-------|
| A1 | Design system | `app/layout.tsx`, `globals.css`, `tailwind.config.ts`, shadcn `components/ui/*` |
| A2 | Sign-in + onboarding | `(auth)/signin`, `OnboardingFlow.tsx` |
| A3 | App shell + sidebar | `AppShell.tsx`, `Sidebar.tsx`, `(app)/layout.tsx` |
| A4 | Dashboard | `dashboard/page.tsx`, `TeamPulseBand.tsx` |
| A5 | Target builder UI | `targets/*`, `TargetBuilder*.tsx`, `PersonalityProfileCard.tsx` |
| A6 | Documents UI | `documents/page.tsx`, `DocumentUploader.tsx` |
| A7 | Scenarios UI | `scenarios/*`, `ScenarioConfigurator.tsx` |
| A8 | Live session UI | `sessions/[id]`, `PreSessionChecklist.tsx`, `LiveSessionPanel.tsx` |
| A9 | Feedback report UI | `reports/[id]`, `FeedbackReport.tsx`, `ScoreGauge.tsx` |
| A10 | Progress UI | `progress/page.tsx`, `ProgressDashboard.tsx` |
| A11 | Library UI | `library/*`, `LibraryBrowser.tsx` |
| A12 | Team UI | `admin/page.tsx`, `assignments/page.tsx` |
| A13 | Settings | `settings/page.tsx` |

**Note:** Use TanStack Query against real APIs once Track B delivers routes. Mock only briefly.

---

## Developer B — Backend (Track B)

**Branch prefix:** `feat/api-`

| # | Task | Files |
|---|------|-------|
| B1 | OpenAI wrapper | `lib/openai.ts` |
| B2 | Beyond Presence wrapper + **spike test** | `lib/beyondPresence.ts`, `scripts/test-bp-call.ts` |
| B3 | Scraper layer | `lib/scraper/*`, `lib/fileParser.ts` |
| B4 | Reconstruction pipeline | `lib/reconstruction.ts` |
| B5 | Embeddings + retriever | `lib/embeddings.ts`, `lib/contextRetriever.ts` |
| B6 | Avatar brief builder | `lib/avatarBriefBuilder.ts` |
| B7 | Evaluator + report builder | `lib/evaluator.ts`, `lib/reportBuilder.ts` |
| B8 | PDF exporter | `lib/pdfExporter.ts` |
| B9 | Targets API | `app/api/targets/**` |
| B10 | Documents API | `app/api/documents/**`, `company-documents/**` |
| B11 | Scenarios API | `app/api/scenarios/**` |
| B12 | Sessions API | `app/api/sessions/**` |
| B13 | Reports API | `app/api/reports/**` |
| B14 | Library + admin + assignments API | `app/api/library/**`, `admin/**`, `assignments`, `coach-comments` |
| B15 | Webhook + rate limit | `webhooks/beyond-presence`, `lib/rateLimit.ts` |
| B16 | Demo seed | `scripts/seed-demo.ts` |

---

## Developer C — AI & Content (Track C)

**Branch prefix:** `feat/content-`

| # | Task | Files |
|---|------|-------|
| C1 | All prompts | `lib/prompts.ts` |
| C2 | 10 professional library JSON | `public/library/*.json` |
| C3 | 5 personal library JSON | `public/library/*.json` |
| C4 | Seed library script | `scripts/seed-library.ts` |
| C5 | Safety phrase validator | add to `lib/schemas.ts` + `evaluator.ts` |

**Library files (15 total):**

Professional: `contrarian-seed-vc`, `data-driven-series-a-vc`, `faang-bar-raiser`, `skeptical-cfo`, `probing-podcast-host`, `aggressive-cross-examiner`, `demanding-board-chair`, `empathetic-hr-partner`, `impatient-prospect`, `technical-deep-dive`

Personal: `conflict-avoidant-partner`, `direct-communicator-partner`, `defensive-partner`, `supportive-parent`, `traditional-parent`

---

## PR Merge Order

```
main
  ← feat/foundation (Steps 1–3)     [FIRST]
  ← feat/content-prompts            [can parallel]
  ← feat/api-targets + feat/ui-targets
  ← feat/api-sessions + feat/ui-sessions   [after BP spike]
  ← feat/api-reports + feat/ui-reports
  ← remaining features
```

---

## Daily Standup Questions

1. Which checkpoint are you unblocking?  
2. Any cross-track file conflicts?  
3. BP / OpenAI / Supabase env blockers?  
