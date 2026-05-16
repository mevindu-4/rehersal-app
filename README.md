# Rehearsal

Practice the real conversation, with the real person, before it happens.

## Quick start

See **[SETUP.md](./SETUP.md)** for your checklist (Supabase, env vars, storage bucket, demo flow).

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

## What's implemented

| Phase | Status |
|-------|--------|
| Foundation (auth, landing, shell, DB migration) | Done |
| Target reconstruction (Jina + Claude + UI) | Done |
| Documents + RAG chunks | Done |
| Scenarios + avatar brief preview | Done |
| Live sessions (Beyond Presence + mock fallback) | Done |
| Evaluation + feedback reports | Done |
| Library clone, progress, dashboard | Done |
| Team/admin, Stripe, PostHog | Not yet |

## Core flow

1. **Library** or **Targets** → personality profile  
2. **Documents** → upload resume/context  
3. **Scenarios** → configure → **Start session**  
4. **End session** → AI feedback report  
