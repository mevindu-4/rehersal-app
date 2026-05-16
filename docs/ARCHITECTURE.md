# Rehearsal — System Architecture

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.x strict |
| Styling | Tailwind CSS 3.x + shadcn/ui |
| Database | Supabase (Postgres) + pgvector |
| AI | OpenAI gpt-4o + text-embedding-3-small |
| Avatar | Beyond Presence Managed Agents |
| Scraping | Cheerio + Jina Reader + youtube-transcript |
| Files | pdf-parse + mammoth |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack Query v5 |
| Auth | Supabase Auth (Google + magic link) |
| Deploy | Vercel |

**Not used:** Stripe, Claude, Pinecone, Express, MongoDB.

---

## High-level diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  (auth) pages  │  (app) pages  │  API Route Handlers        │
└────────────────────────────┬────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   Supabase Auth      Supabase Postgres     Supabase Storage
                      + pgvector RLS
         │                   │
         │                   ├── OpenAI (reconstruct, embed, evaluate)
         │                   └── Beyond Presence (calls, messages)
```

---

## Core pipelines

| Pipeline | Entry | Output |
|----------|-------|--------|
| Reconstruction | POST `/api/targets/[id]/reconstruct` | `personality_json` |
| Embedding | POST `/api/documents` | `document_chunks` + vectors |
| Session | POST `/api/sessions` | `join_url` + system prompt |
| Evaluation | POST `/api/sessions/[id]/end` | `feedback_reports` |

Details: [INTEGRATIONS.md](./INTEGRATIONS.md)

---

## Supabase clients (`lib/db.ts`)

| Client | Where |
|--------|--------|
| `createBrowserClient()` | Client components |
| `createServerClient()` | Server components (cookies) |
| `createServiceClient()` | API routes only — **never browser** |

---

## Auth helpers (`lib/auth.ts`)

- `getCurrentUser()`, `getCurrentOrg()`, `getCurrentMembership()`  
- `requireAuth()`, `requireRole(['coach', 'owner'])`  

---

## Security

- RLS on all tables ([DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md))  
- Service role only in API routes  
- AI safety validation ([SAFETY.md](./SAFETY.md))  
- Consent required before live session  

---

## Code contracts

| File | Purpose |
|------|---------|
| `types/index.ts` | All TS types |
| `lib/schemas.ts` | Zod validation + safety helpers |

---

## Related docs

- [API_SPEC_FULL.md](./API_SPEC_FULL.md)  
- [FRONTEND_SPEC.md](./FRONTEND_SPEC.md)  
- [REPO_STRUCTURE.md](./REPO_STRUCTURE.md)  
