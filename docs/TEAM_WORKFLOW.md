# Rehearsal — 3-Person Team Workflow

How three developers work in parallel **without conflicts** and **without waiting** on each other.

---

## Roles (pick by strength)

| Member | Role | Owns these folders/files |
|--------|------|---------------------------|
| **Member 1** | Platform (DB + API) | `supabase/`, `app/api/`, `lib/db.ts`, `lib/auth.ts`, `lib/beyondPresence.ts`, `lib/rateLimit.ts` |
| **Member 2** | Product UI | `app/(auth)/`, `app/(app)/`, `components/`, `lib/mocks/` (create this) |
| **Member 3** | AI & content | `lib/prompts.ts`, `lib/openai.ts`, `lib/scraper/`, `lib/reconstruction.ts`, `lib/embeddings.ts`, `lib/evaluator.ts`, `lib/reportBuilder.ts`, `public/library/`, `scripts/seed-*.ts` |

### Shared files (coordinate before editing)

| File | Rule |
|------|------|
| `types/index.ts` | One PR at a time; contract changes announced in chat |
| `lib/schemas.ts` | Same as types — Member 1 or 3, not both same day |
| `package.json` | Whoever adds a dependency posts in chat |

---

## Day 0 — Contract merge (2–4 hours, together)

**Branch:** `feat/contracts` (Member 1 leads)

1. Migrations `001–004` run on Supabase  
2. `types/index.ts` + `lib/schemas.ts` match [API_SPEC_FULL.md](./API_SPEC_FULL.md)  
3. `lib/db.ts` + `lib/auth.ts`  
4. **PR reviewed by Members 2 & 3** → merge to `main`

**Members 2 & 3 start same afternoon** (do not wait for full APIs):

- Member 2 → `lib/mocks/` + design system + app shell  
- Member 3 → `lib/prompts.ts` + first 3 library JSON files  

---

## Day 1+ — Parallel branches

```text
main
 ├── feat/api-targets      (Member 1)
 ├── feat/ui-targets       (Member 2, uses mocks)
 └── feat/content-prompts  (Member 3)
```

### Git rules

1. **Pull `main` every morning:** `git fetch origin && git rebase origin/main`  
2. **One feature = one branch** — max ~400 lines per PR  
3. **Merge 1–3× per day** when checks pass  
4. **Never** edit another member's folder without asking  
5. **Never** force-push `main`  

### Handshake when API is ready

Member 1 posts in chat:

```text
POST /api/targets — live on main
Response: CreateTargetResponse (see API_SPEC_FULL.md)
```

Member 2 flips `USE_MOCK = false` in `lib/api/targets.ts`.

---

## Member 2 — Build UI without blocking

Create `lib/mocks/` with fixtures validated against Zod:

```
lib/mocks/
  targets.ts
  scenarios.ts
  sessions.ts
  reports.ts
  dashboard.ts
```

```ts
// lib/api/config.ts
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
```

Use mock data until Member 1's endpoint exists. Shapes **must** match `types/index.ts`.

---

## PR merge order

```
1. feat/contracts          ← FIRST
2. feat/content-prompts    ← parallel
3. feat/ui-shell           ← parallel
4. feat/api-targets + feat/ui-targets
5. feat/api-sessions       ← after BP spike (Member 1)
6. feat/ui-session-report  ← Member 2 can use mock transcript
7. Everything else
```

---

## 15-minute daily sync

Each person, one line:

1. **Yesterday:** merged PR / branch  
2. **Today:** exact paths (e.g. `app/api/sessions/**`)  
3. **Blocker:** env / BP / none  

---

## Conflict hotspots

| Problem | Solution |
|---------|----------|
| Both edit `schemas.ts` | Member 1 owns API schemas; Member 3 owns AI output schemas — split PRs |
| UI/API shape mismatch | Mocks must pass `FeedbackReportSchema.parse()` |
| Session depends on BP | Member 1 runs `scripts/test-bp-call.ts` first; Member 2 mocks iframe URL |
| Solo vs team UI | Read `organization.mode` from context; hide team routes when `solo` |

---

## Environment checklist (each member)

- [ ] `.env.local` from `.env.local.example`  
- [ ] Supabase project access (Member 1 shares project URL)  
- [ ] Member 3: OpenAI key  
- [ ] Member 1: Beyond Presence key (for session work)  

---

## Definition of "done" per PR

- [ ] Types/schemas updated if contract changed  
- [ ] `npm run build` passes  
- [ ] Documented in PR which [SUCCESS_CRITERIA](./SUCCESS_CRITERIA.md) items it touches  
- [ ] No secrets in client code  

See [TASK_ASSIGNMENTS.md](./TASK_ASSIGNMENTS.md) for full task lists per member.
