# Rehearsal — Development Plan

Master plan for building the MVP. **Repo:** [github.com/Rehersal-labs/rehersal-app](https://github.com/Rehersal-labs/rehersal-app)

---

## Critical Path (Sequential — Do First)

These block everything else. **One developer owns this until merged.**

| Step | Deliverable | Owner suggestion |
|------|-------------|------------------|
| **1** | `supabase/migrations/001–004` | Backend lead |
| **2** | `types/index.ts` + `lib/schemas.ts` | Backend lead |
| **3** | `lib/db.ts` + `lib/auth.ts` | Backend lead |

**Acceptance Step 1:** All migrations run on Supabase; 19 tables + RLS visible.  
**Acceptance Step 2:** `tsc --noEmit` passes; all tables have types + Zod schemas.  
**Acceptance Step 3:** Auth helpers work in a test API route.

---

## Parallel Tracks (After Step 1–3 merged)

Open separate branches per track. See [TASK_ASSIGNMENTS.md](./TASK_ASSIGNMENTS.md).

| Track | Focus | Branch prefix |
|-------|--------|---------------|
| **A — Frontend** | Pages, components, design system | `feat/ui-*` |
| **B — Backend** | API routes, lib pipelines, scraper | `feat/api-*` |
| **C — AI & Content** | prompts, library JSON, seed scripts | `feat/content-*` |

---

## Build Order (Recommended)

### Wave 1 — Foundation (blocking)
1. Migrations 001–004  
2. Types + schemas  
3. DB + auth clients  
4. Design system (`globals.css`, `tailwind.config.ts`, shadcn theme)  
5. `.env.local.example`  

### Wave 2 — Auth & shell
6. Sign-in + callback + onboarding  
7. App shell + role-aware sidebar  
8. Root redirect (`/` → dashboard or signin)  

### Wave 3 — Core product (parallel)
9. Target builder + reconstruction API  
10. Documents + embeddings API  
11. Scenarios + avatar brief  
12. Library JSON + seed-library script  

### Wave 4 — Session loop (highest risk)
13. **BP spike:** test `createCall` before live UI  
14. Sessions API + live session page  
15. End + sync + evaluate + report UI  

### Wave 5 — Team & polish
16. Assignments, admin, company docs  
17. Progress dashboard  
18. Settings, PDF export  
19. Rate limiting, safety validation, empty states  

### Wave 6 — QA & deploy
20. RLS two-user test  
21. Seed demo workspace  
22. Vercel deploy + env vars  

---

## File Ownership (Avoid Merge Conflicts)

| Track | Owns |
|-------|------|
| **A** | `app/(auth)/*`, `app/(app)/**/page.tsx`, `components/*` |
| **B** | `app/api/*`, `lib/*` (except `prompts.ts`, `schemas.ts`), `supabase/*`, `scripts/seed-demo.ts` |
| **C** | `lib/prompts.ts`, `types/index.ts`, `lib/schemas.ts`, `public/library/*.json`, `scripts/seed-library.ts` |

**Rule:** If you must edit another track's file, coordinate in PR description and merge quickly.

---

## Cursor Task Template

Every task must include:

```markdown
**Goal:** [one sentence]
**Files:** [exact paths only]
**Requirements:** [specific behaviors]
**Acceptance:** [how to verify]
**Do NOT:** [scope guard]
```

---

## Integration Checkpoints

| Checkpoint | Verify |
|------------|--------|
| CP1 | Migrations + types compile |
| CP2 | User can sign in and reach dashboard |
| CP3 | Target reconstruction returns valid PersonalityJSON |
| CP4 | Document upload embeds chunks in pgvector |
| CP5 | BP `createCall` returns join URL |
| CP6 | Full loop: session → report in < 60s |
| CP7 | Solo hides team UI; team shows pulse + assignments |
| CP8 | Success criteria checklist green |

---

## Dependencies Installed (Baseline)

Next.js 14, TypeScript strict, Tailwind 3, shadcn/ui, `@supabase/supabase-js`, `@supabase/ssr`, `openai`, `zod`, `@tanstack/react-query`, `react-hook-form`, `cheerio`, `pdf-parse`, `mammoth`, `youtube-transcript`, `recharts`, `@react-pdf/renderer`, `lucide-react`.

---

## Related Docs

- [TASK_ASSIGNMENTS.md](./TASK_ASSIGNMENTS.md) — per-developer tasks  
- [SETUP.md](./SETUP.md) — local dev + env  
- [MIGRATIONS.md](./MIGRATIONS.md) — SQL implementation guide  
- [SUCCESS_CRITERIA.md](./SUCCESS_CRITERIA.md) — definition of done  
