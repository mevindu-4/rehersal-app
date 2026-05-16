# Google Authentication — Setup Guide

Google sign-in is **already built** in the app (`components/auth/SignInForm.tsx`). You only need to configure **Supabase** and **Google Cloud**.

---

## How it works

1. User clicks **Continue with Google** on `/signin`
2. Supabase redirects to Google
3. Google returns to **`/callback`** (or `/api/auth/callback`)
4. Server exchanges code → creates session → `provisionNewUser()` if new
5. Redirect: new users → `/onboarding`, returning users → `/dashboard`

Optional: store copies in `.env.local` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (the app reads auth from Supabase, not these vars). You must still paste them into **Supabase → Authentication → Google**.

---

## Step 1 — Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. **APIs & Services → OAuth consent screen**
   - User type: External (or Internal for workspace)
   - App name: Rehearsal
   - Add your email as test user (while in Testing mode)
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized JavaScript origins (local dev):
     - `http://localhost:3000`
     - `https://YOUR_REF.supabase.co` (optional)
   - Authorized redirect URIs — **use Supabase callback** (from Step 2):
     - `https://YOUR_REF.supabase.co/auth/v1/callback`

Copy **Client ID** and **Client Secret**.

---

## Step 2 — Supabase Dashboard

1. [supabase.com](https://supabase.com) → your project
2. **Authentication → Providers → Google**
   - Enable Google
   - Paste Client ID and Client Secret
   - Copy the **Callback URL** shown (for Google redirect URIs)
3. **Authentication → URL Configuration**

| Field | Local development |
|-------|-------------------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/callback` |
| | `http://localhost:3000/api/auth/callback` |

4. **Authentication → Providers → Email** — enable if you want magic link too

---

## Step 3 — App env

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev
```

Open http://localhost:3000/signin → **Continue with Google**

---

## Production (Vercel)

Add to Supabase Redirect URLs:

- `https://your-domain.com/callback`
- `https://your-domain.com/api/auth/callback`

Set `NEXT_PUBLIC_APP_URL=https://your-domain.com`

Add same origin to Google OAuth authorized origins.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Redirect URI mismatch | Google redirect URI must **exactly** match Supabase callback URL |
| `Sign-in failed` after Google | Check Redirect URLs in Supabase include `/callback` |
| Stuck on sign-in | Run migrations; `users` table must exist |
| `redirect_uri_mismatch` | Wrong URI in Google Console |
| Works locally, fails on Vercel | Add production URLs to Supabase + Google |

---

## Code reference

| File | Role |
|------|------|
| `components/auth/SignInForm.tsx` | Google + email UI |
| `app/(auth)/callback/route.ts` | OAuth code exchange |
| `app/api/auth/callback/route.ts` | Alternate callback |
| `lib/auth.ts` | `provisionNewUser()` |
| `middleware.ts` | Protects routes, allows `/signin` + `/callback` |
