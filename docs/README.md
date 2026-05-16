# Rehearsal Documentation

**Start here.** Everything your team needs to build frontend, backend, and AI features.

**Repo:** https://github.com/Rehersal-labs/rehersal-app

---

## For a 3-person team

1. Read [TEAM_WORKFLOW.md](./TEAM_WORKFLOW.md) — roles, branches, no-conflict rules  
2. Member 1 merges `feat/contracts` (migrations + types + schemas)  
3. Each member picks tasks from [TASK_ASSIGNMENTS.md](./TASK_ASSIGNMENTS.md)  

---

## Document map

### Everyone

| Doc | What's inside |
|-----|----------------|
| [PRD.md](./PRD.md) | Product features F1–F14 |
| [SUCCESS_CRITERIA.md](./SUCCESS_CRITERIA.md) | MVP definition of done |
| [SAFETY.md](./SAFETY.md) | AI safety rules |
| [SETUP.md](./SETUP.md) | Clone, env, Supabase, deploy |
| [CONFIG.md](./CONFIG.md) | **Complete env + service checklist** |
| [REPO_STRUCTURE.md](./REPO_STRUCTURE.md) | Folder layout |

### Member 1 — Backend / platform

| Doc | What's inside |
|-----|----------------|
| [REMAINING_WORK.md](./REMAINING_WORK.md) | **What's left for the whole team** |
| [BACKEND_STATUS.md](./BACKEND_STATUS.md) | Backend done + what's left |
| [OPENAI.md](./OPENAI.md) | OpenAI pipelines (test when key added) |
| [GOOGLE_AUTH.md](./GOOGLE_AUTH.md) | **Google sign-in setup** (Supabase + Google Cloud) |
| [API_SPEC_FULL.md](./API_SPEC_FULL.md) | **All endpoints + JSON examples** |
| [API_SPEC.md](./API_SPEC.md) | Route index (quick lookup) |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Tables & enums |
| [MIGRATIONS.md](./MIGRATIONS.md) | SQL migration guide |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | Beyond Presence, OpenAI, scrapers |

### Member 2 — Frontend / UI

| Doc | What's inside |
|-----|----------------|
| [FRONTEND_SPEC.md](./FRONTEND_SPEC.md) | **Every page & component** |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Colors, fonts, motion |

### Member 3 — AI & content

| Doc | What's inside |
|-----|----------------|
| [PROMPTS.md](./PROMPTS.md) | All prompt templates |
| [LIBRARY_JSON_SPEC.md](./LIBRARY_JSON_SPEC.md) | 15 library files + example JSON |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | Pipelines (reconstruction, evaluator) |

### Project lead

| Doc | What's inside |
|-----|----------------|
| [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) | Build order & checkpoints |
| [TASK_ASSIGNMENTS.md](./TASK_ASSIGNMENTS.md) | Task lists per track |

---

## Code is also documentation

| File | Use |
|------|-----|
| `types/index.ts` | TypeScript contracts |
| `lib/schemas.ts` | Zod validation + forbidden phrase check |
| `supabase/migrations/*.sql` | Actual database schema |

When docs and code disagree, **fix code or update docs in the same PR**.

---

## Agent / handoff

- [AGENTS.md](../AGENTS.md) — start here for a new Cursor session  
- [STATUS.md](./STATUS.md) — what’s done and what’s next  

## Quick links

- Cursor rules: [../.cursor/rules/project-rules.md](../.cursor/rules/project-rules.md)  
- Env template: [../.env.local.example](../.env.local.example)  
