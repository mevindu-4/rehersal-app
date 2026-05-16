# Rehearsal — External Integrations

For **Member 1** (BP, Supabase) and **Member 3** (OpenAI, scrapers).

---

## Beyond Presence

**File:** `lib/beyondPresence.ts`  
**Env:** `BEY_API_KEY`, `BEY_AGENT_ID` (server only)  
**Header:** `x-api-key: ${BEY_API_KEY}`

### createCall

```http
POST https://api.bey.dev/v1/calls
Content-Type: application/json
```

**Request body:**
```json
{
  "agent_id": "your-agent-id",
  "livekit_username": "user-display-name",
  "tags": { "source": "rehearsal", "session_id": "uuid" }
}
```

**System prompt:** PATCH `/v1/agents/{agent_id}` with `system_prompt` before `POST /v1/calls` (see `lib/beyondPresence.ts` `createCall`).

**Iframe URL for UI:** `https://bey.chat/{agent_id}` (returned as `join_url` in our API).

**Response (map to `BeyCall` type):**
```json
{
  "id": "call-id",
  "join_url": "https://...",
  "livekit_url": "...",
  "livekit_token": "...",
  "agent_id": "..."
}
```

Store `id` as `sessions.bey_call_id`, `join_url` on session row.

### getCallMessages

```http
GET https://api.bey.dev/v1/calls/{callId}/messages
```

Map to `session_turns`:
- `role: user` → `speaker: user`
- `role: assistant` → `speaker: avatar`
- `sequence` incrementing

### Spike test (run before live UI)

```bash
npx tsx scripts/test-bp-call.ts
```

Prints `join_url` or error. **Highest integration risk in project.**

---

## OpenAI

**File:** `lib/openai.ts`  
**Env:** `OPENAI_API_KEY`

| Function | Model | Use |
|----------|-------|-----|
| `completion(prompt)` | gpt-4o | Text |
| `completionJSON(prompt, schema)` | gpt-4o JSON mode | Reconstruction, evaluation |
| `embed(text)` | text-embedding-3-small | 1536 dims |
| `embedBatch(texts)` | same | Document chunks |

Always run `validateAISafety()` from `lib/schemas.ts` on outputs before save.

---

## Scraper decision tree

**File:** `lib/scraper/index.ts`

```
URL input
  ├─ YouTube? → youtube-transcript
  ├─ Difficult domain? → { status: needs_manual }
  │     linkedin.com, glassdoor.com, x.com, twitter.com,
  │     facebook.com, instagram.com, indeed.com
  ├─ native.ts (Cheerio) → if text.length > 200 → success
  ├─ jina.ts (https://r.jina.ai/{url}) → if text.length > 200 → success
  └─ else → { status: failed }
```

### native.ts

- `fetch` HTML  
- Cheerio: remove nav, footer, script, ads  
- Return `{ text, title }`

### jina.ts

- `GET https://r.jina.ai/` + encodeURIComponent(url)  
- Return markdown/text  
- **Env (optional):** `JINA_API_KEY` — `Authorization: Bearer …` for higher rate limits ([get key](https://jina.ai/?sui=apikey))  
- **Without a key:** public free tier (~20 req/min); fine for local dev

### youtube.ts

- `youtube-transcript` package  
- Return plain transcript text

---

## File parser

**File:** `lib/fileParser.ts`

| Type | Library |
|------|---------|
| PDF | pdf-parse |
| DOCX | mammoth |
| TXT | utf-8 read |

`parseFile(buffer, mime)` dispatcher. **Server-side only.**

---

## Supabase Storage

| Bucket | Purpose |
|--------|---------|
| `documents` | User/company uploads |
| `reports` | Generated PDFs |

Upload flow: client or server uploads → store `file_url` in `user_documents` → POST `/api/documents` triggers extract + embed.

---

## Context retrieval (pgvector)

**File:** `lib/contextRetriever.ts`

```sql
SELECT chunk_text, embedding <=> $1 AS distance
FROM document_chunks
JOIN user_documents ON ...
WHERE org_id = $org
ORDER BY distance
LIMIT 5;
```

Embed `scenario.goal` as query vector. Include company shared docs when `org.mode === 'team'`.

---

## Embeddings chunking

**File:** `lib/embeddings.ts`

- ~512 tokens per chunk  
- 50 token overlap  
- Preserve sentence boundaries  
- Store `chunk_index` in `document_chunks`

---

## Reconstruction pipeline

**File:** `lib/reconstruction.ts`

1. Load sources where `status != failed`  
2. Scrape / parse → update `raw_text`  
3. Concatenate labeled sources  
4. `completionJSON(RECONSTRUCTION_PROMPT, PersonalityJSONSchema)`  
5. `completion(AVATAR_BRIEF_GENERATOR_PROMPT)`  
6. Update target `personality_json`, `avatar_brief_template`, `status: complete`  
7. On error: `status: failed`, `error_message`

---

## Evaluation pipeline

**File:** `lib/evaluator.ts` → `lib/reportBuilder.ts`

1. Load session, turns, scenario, target, context chunks  
2. Format timestamped transcript  
3. `completionJSON(EVALUATOR_PROMPT, EvaluationSchema)` + safety scan  
4. Insert `evaluations`  
5. `completionJSON(REPORT_BUILDER_PROMPT, FeedbackReportSchema)`  
6. Insert `feedback_reports`, `sessions.status = report_ready`
