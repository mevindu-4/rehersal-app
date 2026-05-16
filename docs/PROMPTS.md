# Rehearsal — AI Prompts Reference

**Implementation file:** `lib/prompts.ts`  
**Validation:** `lib/schemas.ts` (`PersonalityJSONSchema`, `EvaluationSchema`, `FeedbackReportSchema`)  
**Safety:** [SAFETY.md](./SAFETY.md) + `validateAISafety()` after every model response

---

## 1. RECONSTRUCTION_PROMPT

**Function:** `buildReconstructionPrompt(labeledSources: string): string`

**Input:** Concatenated source texts with labels, e.g.:

```text
=== SOURCE: LinkedIn (url) ===
...
=== SOURCE: Manual notes ===
...
```

**Output:** JSON only — must parse with `PersonalityJSONSchema`

**Instructions to model:**
- Extract all PersonalityJSON fields  
- Include `source_citations` per field (source name or URL)  
- Include `confidence` per field: `high` | `medium` | `low`  
- Never assign `high` confidence to weak or missing evidence  
- `inferred_concerns_by_context` keys use conversation type enums  
- No markdown, no preamble, no code fences  

---

## 2. AVATAR_PROMPTS (10 conversation types)

**Export:** `AVATAR_PROMPTS: Record<ConversationType, (ctx) => string>`

Each template composes:

1. **Persona block** — from `personality_json` + `avatar_brief_template`  
2. **Behavior rules**
   - One question at a time  
   - Stay in character as target  
   - Natural follow-ups  
   - Never reveal rubric or coach  
   - No coaching during session  
3. **Type-specific block** (see table)  
4. **Difficulty modifier** — from `DIFFICULTY_MODIFIERS[level]`  
5. **Forbidden topics** — protected characteristics, medical, family (except personal type), religion, politics  
6. **Duration** — "Session is {n} minutes; pace accordingly"  

| Type | Type-specific behavior |
|------|------------------------|
| `job_interview` | Behavioral STAR, probe depth on ownership |
| `fundraising_pitch` | Unit economics, why now, wedge, competition |
| `sales_discovery` | Pain, budget, authority, timeline, objections |
| `difficult_conversation` | Direct, stay on issue, acknowledge emotion |
| `negotiation` | Anchoring, trade-offs, silence |
| `deposition_legal` | Precise, narrow answers, impeach inconsistency |
| `media_podcast` | Sound bites, bridging, quotable lines |
| `board_meeting` | Strategic, governance, risk focus |
| `personal_conversation` | Emotional nuance, boundaries, empathy |
| `custom` | Follow user `scenario.goal` primarily |

---

## 3. DIFFICULTY_MODIFIERS (1–5)

**Export:** `DIFFICULTY_MODIFIERS: Record<1|2|3|4|5, string>`

| Level | Label | Prompt behavior |
|-------|-------|-----------------|
| 1 | Patient | Supportive, lets user finish, gentle prompts |
| 2 | Conversational | Light follow-ups |
| 3 | Standard | Professional balanced pacing |
| 4 | Demanding | Probes weakness, interrupts vague answers |
| 5 | Intense | Uncomfortable silences, skeptical, rapid follow-ups |

---

## 4. EVALUATOR_PROMPT

**Function:** `buildEvaluatorPrompt({ transcript, target, scenario, userContext }): string`

**Output:** `EvaluationSchema`

**Required fields:**
- `overall_score` (0–100)  
- `target_fit_score` (0–100)  
- `confidence` (`high` | `medium` | `low`)  
- `summary` (target-specific, 2–4 sentences)  
- `rubric_scores[]` — dimension, score, evidence from transcript  
- `best_moments[]`, `weak_moments[]` — timestamp, user_said, reason (why for **this** target)  
- `missed_signals[]` — timestamp, avatar_signal, likely_meaning  
- `suggested_answers[]` — use vocabulary from user context docs  
- `communication_notes` — filler count, directness/structure/clarity 0–10  

**Safety rules (must be in prompt text):**
- NEVER hire/no-hire  
- NEVER infer honesty, intelligence, mental health, protected traits  
- NEVER reference age, gender, race, religion, disability, family, accent, appearance  
- NEVER score "culture fit"  
- Only observable behavior with transcript evidence  

**Post-process:** `validateAISafety(JSON.stringify(result))` — block or regenerate if unsafe.

---

## 5. REPORT_BUILDER_PROMPT

**Function:** `buildReportBuilderPrompt(evaluation, userContext): string`

**Output:** `FeedbackReportSchema` (human-readable report JSON for UI)

- Expand evaluation into `executive_summary`  
- Format moments for display  
- `suggested_answers` must reuse phrases from uploaded user documents where possible  
- Include `target_name`, `conversation_type`, `session_date`  

---

## 6. AVATAR_BRIEF_GENERATOR_PROMPT

**Function:** `buildAvatarBriefPrompt(personality: PersonalityJSON): string`

**Output:** Plain text, 3–4 sentences for `avatar_brief_template` field.

Captures essence of how avatar should behave — used in `avatarBriefBuilder.ts`.

---

## 7. avatarBriefBuilder composition

**File:** `lib/avatarBriefBuilder.ts` (not prompts.ts but uses it)

Final BP `system_prompt_override` =

```text
{persona + avatar_brief}
{user context block — top 5 chunks}
{AVATAR_PROMPTS[conversation_type]}
{DIFFICULTY_MODIFIERS[difficulty]}
{forbidden topics}
{duration}
```

---

## 8. Versioning

Store `prompt_version` string (e.g. `eval-v1.0`) on each `evaluations` row when prompts change.

---

## 9. Testing checklist

- [ ] Reconstruction with 3 sources returns valid PersonalityJSON  
- [ ] Evaluator returns no forbidden phrases on test transcript  
- [ ] Difficulty 1 vs 5 produces visibly different instructions  
- [ ] Suggested answers reference user doc vocabulary  

See [INTEGRATIONS.md](./INTEGRATIONS.md) for OpenAI wrapper usage.
