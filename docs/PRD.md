# Rehearsal — Product Requirements Document

**Tagline:** Have the conversation before you have it.

---

## 1. Product overview

Rehearsal is a web app where users practice high-stakes conversations with AI avatars — digital twins of people they will face, built from public sources plus user-uploaded context. After each session, users receive a **target-specific feedback report**.

**Powered by:** Beyond Presence (real-time avatar API)

---

## 2. Core loop

1. Build target profile  
2. Upload context documents  
3. Configure scenario  
4. Run live avatar session  
5. Receive feedback report  
6. Track progress over time  

---

## 3. User modes

| Mode | Description |
|------|-------------|
| **Solo** | Individual practice, private workspace |
| **Team** | Shared company docs, coaches assign scenarios, learners complete them |

Team mode **adds** features; it never restricts solo capabilities.

---

## 4. Conversation types (10)

| # | Type | Enum value |
|---|------|------------|
| 1 | Job Interview | `job_interview` |
| 2 | Fundraising Pitch | `fundraising_pitch` |
| 3 | Sales Discovery | `sales_discovery` |
| 4 | Difficult Conversation | `difficult_conversation` |
| 5 | Negotiation | `negotiation` |
| 6 | Deposition / Legal Prep | `deposition_legal` |
| 7 | Media / Podcast Interview | `media_podcast` |
| 8 | Board Meeting | `board_meeting` |
| 9 | Personal Conversation | `personal_conversation` |
| 10 | Custom | `custom` |

---

## 5. Feature specifications

### F1 — Target profile builder

**Goal:** Reconstruct personality model of the person the user will face.

**Inputs:** URLs, PDF/DOCX about target, manual text (private individuals)

**Pipeline:** scrape → store `raw_text` → OpenAI reconstruction → `personality_json` + `avatar_brief_template`

**UI:** 4 steps — Basics → Sources → Reconstruction (poll 3s) → Review

**Personality JSON fields:** `communication_style`, `core_values`, `typical_question_patterns`, `known_priorities`, `known_skepticisms`, `what_impresses_them`, `what_irritates_them`, `expertise_areas`, `behavioral_signals`, `inferred_concerns_by_context`, `source_citations`, `confidence`

→ UI detail: [FRONTEND_SPEC.md](./FRONTEND_SPEC.md#f1--targets)  
→ API: [API_SPEC_FULL.md](./API_SPEC_FULL.md#targets)

---

### F2 — User context engine

Upload PDF/DOCX → Supabase Storage → extract → chunk (512 tokens, 50 overlap) → embed → pgvector

At session start: embed `scenario.goal` → top 5 chunks → inject into avatar system prompt

---

### F3 — Shared company context (team only)

Admins upload org-wide docs (`is_company_shared`). Coaches/learners read. Hidden in solo mode.

---

### F4 — Scenario configurator

10 conversation types, target picker, duration 5–30 min (step 5), difficulty 1–5, goal textarea, document multi-select, avatar brief preview. Coaches assign to learners + due date.

→ [FRONTEND_SPEC.md](./FRONTEND_SPEC.md#f4--scenarios)

---

### F5 — Live avatar session

Pre-session: mic, camera, context summary, **consent checkbox** (required), AI disclosure

Live: BP iframe 16:9, timer, coaching break, end session

Post: sync transcript → evaluate → poll until `report_ready`

→ [INTEGRATIONS.md](./INTEGRATIONS.md#beyond-presence)

---

### F6 — Feedback report (highest priority)

Scores, executive summary, best/weak moments, missed signals, delivery grid, transcript, accuracy rating, PDF export, coach comments (team)

→ [FRONTEND_SPEC.md](./FRONTEND_SPEC.md#f6--feedback-report-appappreportsidpagets--priority)

---

### F7 — Progress dashboard

Metrics, line chart, skill radar (6 axes), session history, per-target bars, team toggle for coaches

---

### F8 — Public figure library

15 cloneable archetypes (10 professional + 5 personal). Browse, filter, clone.

→ [LIBRARY_JSON_SPEC.md](./LIBRARY_JSON_SPEC.md)

---

### F9 — Solo dashboard

Greeting, stats, action cards, continue sessions, targets grid, recommendations, weekly heatmap, empty state

---

### F10 — Team coach dashboard

F9 + team pulse band (4 stats)

---

### F11 — Assignments

Coach: create/manage. Learner: inbox + Start.

---

### F12 — Admin team view

Member table, skill gaps, team reports. Team only.

---

### F13 — Settings

Solo: General, Account, Data. Team: + Team tab (invites, roles). Workspace delete with confirmation.

---

### F14 — Auth & onboarding

Google + magic link. 5-step onboarding. Redirect to `/dashboard`.

---

## 6. Out of scope (MVP)

Stripe, landing/marketing pages, mobile app, SSO, LMS integrations, public API, billing quotas, in-app notification system (toast only).

---

## 7. Related documents

| Doc | Audience |
|-----|----------|
| [FRONTEND_SPEC.md](./FRONTEND_SPEC.md) | UI developer |
| [API_SPEC_FULL.md](./API_SPEC_FULL.md) | Backend developer |
| [PROMPTS.md](./PROMPTS.md) | AI developer |
| [SAFETY.md](./SAFETY.md) | Everyone |
| [SUCCESS_CRITERIA.md](./SUCCESS_CRITERIA.md) | QA / lead |
