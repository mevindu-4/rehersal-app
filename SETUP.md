# Rehearsal — Your setup checklist

Everything below is **your** action list after the codebase was built out.

## 1. Supabase (required)

- [ ] Run `supabase/migrations/001_initial_schema.sql` in **SQL Editor** (if not done)
- [ ] **Storage** → create bucket named `documents` (public or private with signed URLs)
- [ ] **Authentication** → URL config:
  - Site URL: `http://localhost:3000` (or `3001` if Next picked that port)
  - Redirect URLs (add every port you use):
    - `http://localhost:3000/api/auth/callback`
    - `http://localhost:3001/api/auth/callback`
- [ ] **Authentication** → **Providers**:
  - **Email** — enable (for magic link)
  - **Google** — enable only if you want “Continue with Google” (requires Google Cloud OAuth client; see below)

### Enable Google sign-in (optional)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials** → Create **OAuth client ID** (Web application).
2. Authorized redirect URI (exact):
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   (for you: `https://jjgzodakytbioxifmdaf.supabase.co/auth/v1/callback`)
3. Supabase → **Authentication** → **Providers** → **Google** → paste Client ID + Client Secret → **Save**.
4. Retry sign-in at http://localhost:3000/login

## 2. Environment (`.env.local`)

| Variable | Required for |
|----------|----------------|
| `DISABLE_AUTH=true` | **Dev only** — skip login; uses `dev@rehearsal.local` workspace. Set `false` before production. |
| `NEXT_PUBLIC_SUPABASE_URL` | Always |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Always |
| `SUPABASE_SERVICE_ROLE_KEY` | API routes |
| `GEMINI_API_KEY` | **Recommended** — get free tier at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `LLM_PROVIDER=gemini` | Force Gemini (auto-selected if `GEMINI_API_KEY` is set) |
| `ANTHROPIC_API_KEY` | Alternative to Gemini |
| `LLM_DEMO_MODE=true` | Skip AI (placeholder profiles/reports) |
| `OPENAI_API_KEY` | Better document search (optional; keyword fallback works) |
| `BEY_API_KEY` | Live avatar (optional; demo uses mock transcript) |
| `BEY_AGENT_ID` | Live avatar agent ID from Beyond Presence dashboard |

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 4. Happy-path demo (no Beyond Presence)

1. **Library** → clone **The Contrarian Seed VC** (or any archetype)
2. **Documents** → upload your resume (PDF/DOCX)
3. **Scenarios** → new scenario → pick target → set goal → **Start session**
4. On session page → consent → **Start** → **End session** (mock transcript runs)
5. Wait for report → view scores and feedback

## 5. Full avatar (Beyond Presence)

1. Create **Managed Agent** at [beyondpresence.com](https://beyondpresence.com) (Agents page — not Avatar ID)
2. Add `BEY_API_KEY` and `BEY_AGENT_ID` to `.env.local` (both from the **same** account)
3. Restart `npm run dev`
4. Verify agent ID: open [http://localhost:3000/api/bey/agents](http://localhost:3000/api/bey/agents) — `configured_agent_found` should be `true`
5. Run `supabase/migrations/002_sessions_livekit_token.sql` in Supabase SQL Editor
6. Start session — in-app LiveKit video (allow camera/mic)

| Error | Fix |
|-------|-----|
| `Agent not found` | Wrong `BEY_AGENT_ID`, or API key from a different BP account. Use `/api/bey/agents` to get the correct `id`. |

## 6. Build a real target (Phase 2 flow)

1. **Targets** → Create target
2. Add LinkedIn URL or manual description (+ optional PDF)
3. **Build profile** (uses Claude + Jina scrape)
4. Review personality card → create scenario → rehearse

## 7. Deploy (Vercel)

- Push to GitHub → import in Vercel
- Add all env vars
- Add production URL to Supabase redirect URLs

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 401 on API | Sign out/in; ensure migration + auto workspace bootstrap ran |
| Reconstruction fails | Check `ANTHROPIC_API_KEY`; add manual text source if URL scrape fails |
| Upload fails | Create `documents` storage bucket in Supabase |
| Empty report | End session again; check Anthropic key and server logs |
| Magic link `429` | Supabase email rate limit (~4/hour per address on free tier). Wait ~1 hour, avoid repeated clicks |
| `provider is not enabled` | Enable **Google** under Supabase → Authentication → Providers, or use **Email** magic link instead |
| Auth redirect fails | Match Supabase redirect URLs to the port in your browser (`3000` vs `3001`) |
