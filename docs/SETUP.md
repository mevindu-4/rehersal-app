# Rehearsal — Developer Setup

**Full reference:** [CONFIG.md](./CONFIG.md)

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Fill .env.local — see CONFIG.md
npm run setup:check
npm run verify:supabase
npm run dev
```

## Prerequisites

- Node.js 18+, npm  
- Supabase project  
- OpenAI API key  
- Beyond Presence Managed Agent  
- Google Cloud OAuth (for sign-in)  
- Jina API key (recommended for URL scraping)

---

## Environment variables

See `.env.local.example` and [CONFIG.md](./CONFIG.md) for the full list.

**Never expose to browser:** `SUPABASE_SERVICE_ROLE_KEY`, `BEY_API_KEY`, `OPENAI_API_KEY`, `JINA_API_KEY`, `RESEND_API_KEY`, `BEY_WEBHOOK_SECRET`.

Check env without printing secrets:

```bash
npm run setup:check
```

---

## Supabase

1. Create project at [supabase.com](https://supabase.com)  
2. Run migrations **001 → 008** from `supabase/migrations/` in SQL Editor  
3. Enable Auth: **Google** + **Email (magic link)**  
4. Set redirect URLs: `/callback` and `/api/auth/callback`  
5. Enable **vector** extension if migration 003 fails  

```bash
npm run verify:supabase
npm run seed:library
```

---

## Beyond Presence

```bash
npx tsx --env-file=.env.local scripts/test-bp-call.ts
```

---

## Deploy (Vercel)

Copy all env vars from `.env.local.example`. Set `NEXT_PUBLIC_APP_URL` to production URL.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Supabase URL wrong | Use `https://xxx.supabase.co` only — no `/rest/v1` |
| RLS denies insert | Service client in API routes; check `org_id` |
| pgvector error | Run migration 003; enable vector extension |
| Upload fails | Run migration 008 |
| Library seed fails | Run migrations 006 + 007 |
| BP call fails | `BEY_API_KEY`, `BEY_AGENT_ID` |
| Scrape fails | `JINA_API_KEY` or manual paste |
| AI fails | `OPENAI_API_KEY` |
