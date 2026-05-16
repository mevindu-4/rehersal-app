# Rehearsal — Library JSON Specification

Files live in `public/library/*.json`. Validated by `LibraryProfileSchema` in `lib/schemas.ts`.

---

## File naming

`{slug}.json` — e.g. `contrarian-seed-vc.json`

---

## Full schema

```json
{
  "id": "lib_contrarian_seed_vc",
  "name": "The Contrarian Seed VC",
  "title": "General Partner",
  "company": "Apex Ventures",
  "domain": "fundraising",
  "category": "professional",
  "tags": ["vc", "seed", "skeptical", "contrarian"],
  "profile_json": { },
  "avatar_brief_template": "3-4 sentences describing how the avatar behaves in session.",
  "source_urls": [
    "https://example.com/podcast-episode"
  ],
  "is_featured": true
}
```

| Field | Type | Required |
|-------|------|----------|
| `id` | string | Yes — prefix `lib_`, matches DB `public_figure_library.id` |
| `name` | string | Yes |
| `title` | string | null ok |
| `company` | string | null ok |
| `domain` | Domain enum | Yes — see `types/index.ts` |
| `category` | `professional` \| `personal` \| `real_figure` | Yes |
| `tags` | string[] | Yes |
| `profile_json` | PersonalityJSON | Yes — full object |
| `avatar_brief_template` | string | Yes |
| `source_urls` | string[] | Yes (can be empty `[]`) |
| `is_featured` | boolean | Optional — max 3 featured |

**Not in JSON file** (set by seed script): `usage_count`, `accuracy_rating`, `moderation_status` → defaults `0`, `null`, `approved`.

---

## `profile_json` (PersonalityJSON)

Must include all fields:

```json
{
  "communication_style": {
    "directness": "Very direct; interrupts rambling",
    "formality": "Casual but authoritative",
    "pace": "Fast; expects concise answers",
    "listening_style": "Listens for inconsistencies"
  },
  "core_values": ["Intellectual honesty", "Founder grit"],
  "typical_question_patterns": [
    "Why now?",
    "What's your unfair advantage?"
  ],
  "known_priorities": ["Unit economics path", "Wedge in large market"],
  "known_skepticisms": ["TAM slides without bottoms-up", "Buzzwords"],
  "what_impresses_them": ["Specific data", "Clear no"],
  "what_irritates_them": ["Hand-waving", "Avoiding hard questions"],
  "expertise_areas": ["Seed stage", "B2B SaaS"],
  "behavioral_signals": ["Leans back when skeptical", "Rapid follow-ups"],
  "inferred_concerns_by_context": {
    "fundraising_pitch": ["Burn rate", "Competition"],
    "job_interview": []
  },
  "source_citations": {
    "known_skepticisms": "Podcast Episode 42, minute 12"
  },
  "confidence": {
    "known_skepticisms": "high",
    "behavioral_signals": "medium"
  }
}
```

---

## Example excerpt — Contrarian Seed VC

**avatar_brief_template:**

> You are a skeptical seed-stage GP who asks "why now" within the first five minutes. You shut down when founders dodge hard questions. You reward specific, data-backed answers and lose patience with vague TAM claims.

**category:** `professional`  
**domain:** `fundraising`

---

## 15 required files

### Professional (10)

| File | id |
|------|-----|
| `contrarian-seed-vc.json` | `lib_contrarian_seed_vc` |
| `data-driven-series-a-vc.json` | `lib_data_driven_series_a_vc` |
| `faang-bar-raiser.json` | `lib_faang_bar_raiser` |
| `skeptical-cfo.json` | `lib_skeptical_cfo` |
| `probing-podcast-host.json` | `lib_probing_podcast_host` |
| `aggressive-cross-examiner.json` | `lib_aggressive_cross_examiner` |
| `demanding-board-chair.json` | `lib_demanding_board_chair` |
| `empathetic-hr-partner.json` | `lib_empathetic_hr_partner` |
| `impatient-prospect.json` | `lib_impatient_prospect` |
| `technical-deep-dive.json` | `lib_technical_deep_dive` |

### Personal (5)

| File | id |
|------|-----|
| `conflict-avoidant-partner.json` | `lib_conflict_avoidant_partner` |
| `direct-communicator-partner.json` | `lib_direct_communicator_partner` |
| `defensive-partner.json` | `lib_defensive_partner` |
| `supportive-parent.json` | `lib_supportive_parent` |
| `traditional-parent.json` | `lib_traditional_parent` |

---

## Real figures

If `category` is `real_figure`, UI must show disclaimer:

> This profile is synthesized from public information. This is a simulation for practice purposes.

---

## Seed command

```bash
npm run seed:library
```

Reads `public/library/*.json`, validates with Zod, upserts into `public_figure_library`.
