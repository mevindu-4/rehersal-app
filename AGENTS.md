# Rehearsal — Agent onboarding

New Cursor agent? Read this first, then code.

## 1. Documentation

| Step | File |
|------|------|
| Index | [docs/README.md](./docs/README.md) |
| Your role | [docs/TEAM_WORKFLOW.md](./docs/TEAM_WORKFLOW.md) |
| Live status | [docs/STATUS.md](./docs/STATUS.md) |

## 2. Code contracts (source of truth)

- `types/index.ts` — all TypeScript types
- `lib/schemas.ts` — Zod validation + AI safety
- `docs/API_SPEC_FULL.md` — API request/response shapes

If docs and code disagree, fix both in the same PR.

## 3. Rules

- Follow [.cursor/rules/project-rules.md](./.cursor/rules/project-rules.md)
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `BEY_API_KEY`, `OPENAI_API_KEY` to the client
- Validate API bodies with Zod; check auth on every route
- Read [docs/SAFETY.md](./docs/SAFETY.md) for AI/evaluator work

## 4. Commands

```bash
npm install
cp .env.local.example .env.local   # fill values
npm run setup:check
npm run verify:supabase
npm run dev
```

## 5. Typical tasks

| Task | Doc |
|------|-----|
| New API route | `docs/API_SPEC_FULL.md` |
| New page / component | `docs/FRONTEND_SPEC.md` |
| Prompts / library JSON | `docs/PROMPTS.md`, `docs/LIBRARY_JSON_SPEC.md` |

Do not invent endpoints or features outside the docs.
