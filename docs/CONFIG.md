# Rehearsal — Complete Configuration Reference

Single checklist for env vars, Supabase, OAuth, storage, and third-party services.

---

## 1. Environment file

Copy template and fill values:

```bash
cp .env.local.example .env.local
npm run setup:check
```

### Required

| Variable | Example / notes |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_REF.supabase.co` — **no** `/rest/v1` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret — server only |
| `BEY_API_KEY` | [bey.dev](https://bey.dev) |
| `BEY_AGENT_ID` | Managed Agent UUID |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (dev) |

### Recommended

| Variable | Notes |
|----------|--------|
| `JINA_API_KEY` | [jina.ai/?sui=apikey](https://jina.ai/?sui=apikey) — URL scrape fallback |

### Optional

| Variable | Notes |
|----------|--------|
| `BEY_WEBHOOK_SECRET` | BP webhook signature; dev can leave empty |
| `DATABASE_URL` | Postgres URI for `npm run db:sql` / `db:repair:007` (Supabase → Database → Connection string) |
| `RESEND_API_KEY` | Email (not wired in MVP) |
| `NEXT_PUBLIC_POSTHOG_KEY` | Analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | Default `https://us.i.posthog.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking (not wired yet) |

**Google OAuth:** Optional `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env.local` for your records. The app uses **Supabase** for Google sign-in — paste the same values into **Supabase → Authentication → Google**. See [GOOGLE_AUTH.md](./GOOGLE_AUTH.md).

### Server-only (never `NEXT_PUBLIC_`)

`SUPABASE_SERVICE_ROLE_KEY`, `BEY_API_KEY`, `OPENAI_API_KEY`, `JINA_API_KEY`, `RESEND_API_KEY`, `BEY_WEBHOOK_SECRET`

---

## 2. Supabase

### Migrations (run in SQL Editor, in order)

```
001_initial_schema.sql
002_rls_policies.sql
003_pgvector_setup.sql
004_seed_indexes.sql
005_audit_logs_and_columns.sql
006_repair_library_and_rpc.sql
007_fix_public_figure_library.sql
008_storage_buckets.sql
```

Verify:

```bash
npm run verify:supabase
```

### Auth → URL configuration

| Field | Local dev |
|-------|-----------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/callback` |
| | `http://localhost:3000/api/auth/callback` |

### Auth → Providers

- Email (magic link) — ON  
- Google — ON + Client ID/Secret from Google Cloud  

### Storage buckets (via migration 008 or dashboard)

| Bucket | Public | Use |
|--------|--------|-----|
| `documents` | Yes | PDF/DOCX uploads |
| `reports` | No | Generated PDFs |

### Extensions

Enable **vector** (Database → Extensions) if migration 003 fails.

---

## 3. Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → Credentials → OAuth 2.0 Client (Web)  
2. Authorized redirect URI = Supabase Auth → Google → **Callback URL**  
3. Paste Client ID + Secret into Supabase → Authentication → Google  

---

## 4. Beyond Presence

| Step | Action |
|------|--------|
| API key | `BEY_API_KEY` in `.env.local` |
| Agent | `BEY_AGENT_ID` from Managed Agent |
| Webhook (prod) | `https://YOUR_APP/api/webhooks/beyond-presence` |
| Test | `npx tsx --env-file=.env.local scripts/test-bp-call.ts` |

---

## 5. OpenAI

Models used: `gpt-4o`, `text-embedding-3-small` (1536 dimensions).

Used for: target reconstruction, document embeddings, session evaluation, reports.

---

## 6. Jina Reader

- Env: `JINA_API_KEY`  
- Code: `lib/scraper/jina.ts` — fallback after native Cheerio  
- Blocked domains (manual paste): LinkedIn, X, Glassdoor, Facebook, Instagram, Indeed  

---

## 7. Seed & run

```bash
npm install
npm run setup:check
npm run verify:supabase
npm run seed:library
npm run dev
```

---

## 8. Vercel production

Add every key from `.env.local.example`. Set `NEXT_PUBLIC_APP_URL` to production domain. Update Supabase redirect URLs to match.

---

## 9. Status commands

| Command | Purpose |
|---------|---------|
| `npm run setup:check` | Env vars present (no secrets printed) |
| `npm run verify:supabase` | Tables + library schema |
| `npm run seed:library` | 15 public figure profiles |
| `npm run seed:demo` | Demo workspace |

---

## 10. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Auth / DB errors | Fix `NEXT_PUBLIC_SUPABASE_URL` (no `/rest/v1`) |
| Upload fails | Run `008_storage_buckets.sql` |
| Library seed fails | Run `006` + `007` |
| Embeddings fail | Run `003`, enable vector extension |
| Scrape fails | Set `JINA_API_KEY` or paste manual text |
| AI features fail | Set `OPENAI_API_KEY` |
| Live session fails | Check `BEY_API_KEY` + `BEY_AGENT_ID` |
