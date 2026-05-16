# Rehearsal — What’s Left to Do

Quick map for a **3-person team**. Backend code is ~done; most remaining work is **verify, deploy, and frontend**.

---

## Backend (your track)

### Ready now (no OpenAI)

| Task | Command / action |
|------|------------------|
| Run SQL migrations | Supabase → `supabase/RUN_PENDING.sql` |
| Verify DB | `npm run backend:ready` |
| Test BP | `npm run test:bp` |
| Seed library | `npm run seed:library` |

### When OpenAI key added (test later)

| Task | Command / action |
|------|------------------|
| Add key | `OPENAI_API_KEY` in `.env.local` |
| Smoke test AI | `npm run test:openai` |
| Embed a document | `POST /api/documents/upload` → embed completes |
| Reconstruct target | `POST /api/targets/:id/reconstruct` |
| Full session → report | end session → poll until `report_ready` |

Details: [OPENAI.md](./OPENAI.md)

### Backend optional / later

- [ ] RLS two-user manual test
- [ ] Team invite emails (Resend)
- [ ] `BEY_WEBHOOK_SECRET` in production
- [ ] Vercel deploy + env vars
- [ ] Workspace delete API (danger zone)

---

## Frontend (other teammate)

- [x] Sign-in UI (Google + magic link) — code in `SignInForm.tsx`; configure [GOOGLE_AUTH.md](./GOOGLE_AUTH.md)
- [ ] Wire all pages to real APIs (remove mocks)
- [ ] Mobile polish
- [ ] Report page polish (highest UX priority)

See [FRONTEND_SPEC.md](./FRONTEND_SPEC.md).

---

## AI / content (optional 3rd teammate)

- [ ] Tune prompts in `lib/prompts.ts`
- [ ] Validate 15 library JSON profiles
- [ ] `npm run seed:demo` for demo data

See [PROMPTS.md](./PROMPTS.md), [LIBRARY_JSON_SPEC.md](./LIBRARY_JSON_SPEC.md).

---

## Full product “done” checklist

See [SUCCESS_CRITERIA.md](./SUCCESS_CRITERIA.md).

---

## Who owns what

| Track | Folders |
|-------|---------|
| Backend | `app/api/`, `lib/`, `supabase/`, `scripts/` |
| Frontend | `app/(app)/`, `components/` |
| Docs / plan | `docs/` |

Coordination: [TEAM_WORKFLOW.md](./TEAM_WORKFLOW.md)
