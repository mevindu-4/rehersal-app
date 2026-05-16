# Rehearsal — OpenAI Integration (Backend)

Use this when you add `OPENAI_API_KEY` to `.env.local`. **Test later** with `npm run test:openai`.

---

## Model usage

| Feature | Model | File |
|---------|-------|------|
| Reconstruction | `gpt-4o` JSON | `lib/reconstruction.ts` |
| Avatar brief | `gpt-4o` text | `lib/reconstruction.ts` |
| Embeddings | `text-embedding-3-small` (1536 dims) | `lib/embeddings.ts` |
| Session evaluation | `gpt-4o` JSON | `lib/evaluator.ts` |
| Report expansion | `gpt-4o` JSON | `lib/reportBuilder.ts` |

All prompts: **`lib/prompts.ts`** · Validation: **`lib/schemas.ts`**

---

## Pipelines (in order)

### 1. Document embedding

```
POST /api/documents/upload  OR  POST /api/documents
  → extract text (pdf-parse / mammoth)
  → POST /api/documents/embed (optional)
  → lib/embeddings.ts: chunk → embedBatch → document_chunks
```

**Requires:** pgvector + `match_document_chunks` RPC (migration 006).

### 2. Target reconstruction

```
POST /api/targets/:id/sources  (add URL / manual / doc)
POST /api/targets/:id/reconstruct
  → scrape sources → buildReconstructionPrompt → PersonalityJSONSchema
  → buildAvatarBriefPrompt → save personality_json + avatar_brief_template
```

Poll target: `status` → `complete` | `failed`.

### 3. Live session (no OpenAI at call time)

```
POST /api/sessions
  → retrieveContext (embed query — needs embedded docs)
  → buildAvatarSystemPrompt (lib/avatarBriefBuilder.ts + prompts.ts)
  → Beyond Presence createCall
```

Works without embedded docs (fallback context message).

### 4. Post-session evaluation

```
POST /api/sessions/:id/end
  → syncSessionTurns (Beyond Presence)
  → evaluateSession (async)
      → buildEvaluatorPrompt → EvaluationSchema
      → buildFeedbackReport → FeedbackReportSchema
  → session.status = report_ready
```

Poll: `GET /api/sessions/:id` until `report_ready`.

---

## API routes (OpenAI-gated)

Return **503** `OPENAI_NOT_CONFIGURED` if key missing:

| Route | Action |
|-------|--------|
| `POST /api/targets/[id]/reconstruct` | Start reconstruction |
| `POST /api/documents/embed` | Embed document(s) |
| `POST /api/sessions/[id]/evaluate` | Re-run evaluation |

---

## Safety

- Prompts include safety rules (`lib/prompts.ts`)
- `validateAISafety()` runs on all model text outputs (`lib/openai.ts`)
- Evaluator + report outputs checked before DB save

Forbidden: hire/no-hire, protected traits, culture fit, etc. See [SAFETY.md](./SAFETY.md).

---

## When you add the key

```bash
# .env.local
OPENAI_API_KEY=sk-...

npm run setup:check
npm run test:openai
```

### Manual E2E (with auth cookie)

1. Upload doc → wait `embedding_status: complete`
2. Create target + sources → `POST .../reconstruct`
3. Create scenario → `POST /api/sessions`
4. End session → wait `report_ready`
5. `GET /api/reports/:id`

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `OPENAI_NOT_CONFIGURED` | Add key, restart `npm run dev` |
| `Failed to parse AI JSON` | Retry; check prompt_version in logs |
| `AI output blocked` | Safety filter triggered — review transcript/prompt |
| Embedding RPC missing | Run `supabase/RUN_PENDING.sql` |
| Empty context at session | Embed documents first |
