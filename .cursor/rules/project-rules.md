# Rehearsal — Cursor Operating Rules

Every Cursor task must include:

- **Goal:** one sentence on what this achieves
- **Files to touch:** exact paths only (no globs)
- **Acceptance criteria:** how to verify it works
- **Do NOT:** scope guard

## Never

- Give Cursor broad prompts like "build the app"
- Invent API endpoints not in `docs/API_SPEC.md`
- Invent Beyond Presence endpoints not in official BP docs
- Mix unrelated changes in one prompt
- Skip TypeScript types
- Commit non-working code

## Always

- One route, one component, or one function per Cursor prompt
- Use exact file paths from the repository structure
- Import types from `/types/index.ts`
- Import schemas from `/lib/schemas.ts`
- Validate API request bodies with Zod
- Check user session before any DB operation
- Use server components by default; client only when needed
- Keep `BEY_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` server-side only
- Commit after every working vertical slice

## Development order

1. Types and schemas before UI
2. Migrations before API routes
3. API routes before pages that consume them
4. Integration testing after phases A–K

## Safety

- Run `validateAISafety()` on all AI outputs
- Never expose service role keys to the browser
- Enforce consent before live sessions
- RLS must block cross-org access
