# Rehearsal

**Have the conversation before you have it.**

AI avatar platform for rehearsing high-stakes conversations with realistic target-person simulations.

- **Stack:** Next.js 14 · Supabase · OpenAI · Beyond Presence  
- **Repo:** https://github.com/Rehersal-labs/rehersal-app  

---

## Team documentation (read first)

All specs live in **[`/docs`](./docs/README.md)** — frontend, backend, AI, and 3-person workflow.

| Role | Start here |
|------|------------|
| **Everyone** | [docs/README.md](./docs/README.md) |
| **3 devs parallel** | [docs/TEAM_WORKFLOW.md](./docs/TEAM_WORKFLOW.md) |
| **Frontend** | [docs/FRONTEND_SPEC.md](./docs/FRONTEND_SPEC.md) + [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) |
| **Backend** | [docs/API_SPEC_FULL.md](./docs/API_SPEC_FULL.md) + [docs/INTEGRATIONS.md](./docs/INTEGRATIONS.md) |
| **AI / content** | [docs/PROMPTS.md](./docs/PROMPTS.md) + [docs/LIBRARY_JSON_SPEC.md](./docs/LIBRARY_JSON_SPEC.md) |

---

## Quick start

```bash
git clone https://github.com/Rehersal-labs/rehersal-app.git
cd rehersal-app
npm install
cp .env.local.example .env.local
# Fill env vars — see docs/SETUP.md
npm run dev
```

---

## Contracts in code

- `types/index.ts` — TypeScript types  
- `lib/schemas.ts` — Zod schemas + safety validation  
- `supabase/migrations/` — Database schema  

---

## Cursor

See [`.cursor/rules/project-rules.md`](./.cursor/rules/project-rules.md).
