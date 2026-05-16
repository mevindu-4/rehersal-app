# Merging backend + frontend (team workflow)

## What’s blocking you

GitHub only has two branches:

| Branch | Contents |
|--------|----------|
| `main` | Planning docs only (`08afb5a`) |
| `thanoban` | Your backend commits (pushed) |

Your teammate’s **frontend is on your machine only** — hundreds of new files under `app/(app)/`, `components/`, etc. are **not committed or pushed**. Git cannot merge work that isn’t in a commit.

`thanoban` already contains all of `main` (no merge conflicts). `npm run build` passes with frontend + backend combined locally.

---

## Fix in 4 steps

### 1. Commit everything on `thanoban`

```powershell
cd d:\PROJECTS\Startup\CursorBuildathon\RehersalAi
git checkout thanoban
git add -A
git status
# Confirm .env.local is NOT listed (must stay gitignored)
git commit -m "Integrate full frontend with backend APIs and library."
```

### 2. Push

```powershell
git push origin thanoban
```

### 3. Open a Pull Request on GitHub

- Base: `main`
- Compare: `thanoban`
- Should merge **without conflicts** (main is an ancestor of thanoban)

Or merge locally:

```powershell
git checkout main
git pull origin main
git merge thanoban
git push origin main
```

### 4. Teammate workflow next time

Avoid copying folders. Each person uses a branch:

```text
main
 ├── thanoban     (backend)
 └── frontend/ui  (teammate)  → merge into thanoban or main via PR
```

```powershell
# Teammate
git checkout -b frontend/ui
git add -A && git commit -m "Add app pages and components"
git push -u origin frontend/ui

# You
git fetch origin
git merge origin/frontend/ui
# resolve conflicts if any, then push
```

---

## If GitHub still shows conflicts

Usually the same file was edited on both sides (e.g. `middleware.ts`, `package.json`, `types/index.ts`, `lib/schemas.ts`).

1. Open the conflicted file
2. Remove `<<<<<<<`, `=======`, `>>>>>>>` markers
3. Keep **both**: auth/middleware from backend + UI routes from frontend
4. `npm run build` must pass
5. `git add .` && `git commit`

---

## Files both sides often touch

| File | Keep |
|------|------|
| `middleware.ts` | Session refresh + protect routes; public `/signin`, `/callback` |
| `package.json` | Union of dependencies from both branches |
| `types/index.ts` / `lib/schemas.ts` | Backend types win; frontend must match API |
| `app/(auth)/signin/page.tsx` | `SignInForm` component |
| `.env.local.example` | All keys documented; never commit `.env.local` |

---

## Verify before merge

```powershell
npm run setup:check
npm run build
git push origin thanoban
```

Then merge PR `thanoban` → `main`.
