# Rehearsal — Repository Structure

Build at **repo root** (not a nested `/rehearsal` folder). Remote: [Rehersal-labs/rehersal-app](https://github.com/Rehersal-labs/rehersal-app).

```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── signin/page.tsx
│   │   ├── onboarding/page.tsx
│   │   └── callback/route.ts
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── targets/...
│   │   ├── documents/page.tsx
│   │   ├── company-documents/page.tsx
│   │   ├── scenarios/...
│   │   ├── sessions/[id]/page.tsx
│   │   ├── reports/[id]/page.tsx
│   │   ├── library/...
│   │   ├── progress/page.tsx
│   │   ├── assignments/page.tsx
│   │   ├── admin/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── auth/callback/route.ts
│       ├── targets/...
│       ├── documents/...
│       ├── company-documents/...
│       ├── scenarios/...
│       ├── sessions/...
│       ├── reports/...
│       ├── library/...
│       ├── admin/...
│       ├── assignments/route.ts
│       ├── coach-comments/route.ts
│       └── webhooks/beyond-presence/route.ts
├── components/
│   ├── ui/                    # shadcn
│   ├── targets/
│   ├── documents/
│   ├── scenarios/
│   ├── sessions/
│   ├── reports/
│   ├── progress/
│   ├── library/
│   ├── admin/
│   └── shared/
├── lib/
│   ├── db.ts, auth.ts, openai.ts, beyondPresence.ts
│   ├── scraper/, fileParser.ts
│   ├── reconstruction.ts, embeddings.ts, contextRetriever.ts
│   ├── avatarBriefBuilder.ts, evaluator.ts, reportBuilder.ts
│   ├── pdfExporter.ts, prompts.ts, schemas.ts, utils.ts
│   ├── rateLimit.ts, posthog.ts
├── types/index.ts
├── supabase/migrations/
├── scripts/
├── public/library/            # 15 JSON profiles
├── docs/                      # Planning (this folder)
└── .cursor/rules/
```
