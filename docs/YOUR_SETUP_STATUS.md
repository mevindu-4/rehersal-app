# Your Rehearsal setup status

Generated from automated checks. Re-run: `npm run setup:check && npm run verify:supabase`

## Done automatically

| Item | Status |
|------|--------|
| Supabase URL fixed (removed `/rest/v1`) | ✓ |
| Jina API key in `.env.local` | ✓ |
| Beyond Presence keys | ✓ |
| Supabase keys | ✓ |
| Core tables exist | ✓ |
| `match_document_chunks` RPC | ✓ |
| Docs: `docs/CONFIG.md` | ✓ |
| Script: `npm run setup:check` | ✓ |
| Migration `008_storage_buckets.sql` added | ✓ |
| One-click SQL: `supabase/RUN_PENDING.sql` | ✓ |

## You must do (2 steps)

### 1. Add OpenAI key

In `.env.local`:

```env
OPENAI_API_KEY=sk-...
```

Get from: https://platform.openai.com/api-keys

### 2. Run pending SQL in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste contents of **`supabase/RUN_PENDING.sql`**
3. Click **Run**

Then verify:

```bash
npm run verify:supabase
npm run seed:library
npm run dev
```

## Optional later

- Google OAuth in Supabase + Google Cloud (sign-in UI still stub)
- `BEY_WEBHOOK_SECRET` for production webhooks
- PostHog / Resend / Sentry keys

## Command reference

```bash
npm run setup:check      # env vars (no secrets printed)
npm run verify:supabase  # DB + library schema
npm run seed:library     # 15 public profiles
npm run dev              # start app
```
