# Rehearsal — Project status

Last updated: 2026-05-16

## Build

- `npm run build` — passing (40 routes)
- `npm run setup:check` — `OPENAI_API_KEY` recommended for full AI features

## Completed

- [x] Database migrations (001–008) + repair scripts
- [x] Types + Zod schemas
- [x] All API routes (35 handlers)
- [x] AI pipelines (reconstruction, embeddings, evaluator, report builder)
- [x] Beyond Presence integration + `npm run test:bp`
- [x] 15 library JSON profiles in `public/library/`
- [x] Full frontend: app shell, sidebar, all product pages
- [x] Sign-in UI (Google + magic link) + route protection in middleware
- [x] Auth callbacks — `/callback`, `/api/auth/callback`
- [x] Onboarding flow

## Needs verification / polish

- [ ] End-to-end live session with real BP + OpenAI keys
- [ ] Google OAuth configured in Supabase Dashboard
- [ ] Run `supabase/RUN_PENDING.sql` on hosted Supabase
- [ ] `npm run seed:library` after migrations
- [ ] Team invite emails (audit log only today)
- [ ] Production deploy on Vercel

## Env blockers

| Variable | Required for |
|----------|----------------|
| `OPENAI_API_KEY` | Reconstruction, embeddings, evaluation |
| `BEY_API_KEY` + `BEY_AGENT_ID` | Live avatar sessions |
| Supabase keys | Everything |

Run: `npm run setup:check`

## Next tasks

1. Add `OPENAI_API_KEY` → `npm run test:openai`
2. Configure Google in Supabase → test sign-in
3. `npm run backend:ready` on shared Supabase project
4. Deploy to Vercel with env vars

See [fix.md](../fix.md) for detailed audit. Two-dev split: [TEAM_WORKFLOW.md](./TEAM_WORKFLOW.md).
