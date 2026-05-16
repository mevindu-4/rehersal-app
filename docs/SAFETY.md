# Rehearsal — Safety Requirements

These rules must be enforced in **prompts** and **validated in code**.

---

## Evaluator must NEVER

- Output hire/no-hire recommendations  
- Infer personality, honesty, intelligence, mental health, hireability  
- Reference age, gender, race, religion, disability, family status, accent, appearance  
- Score "culture fit" or similar subjective traits  

---

## Avatar must NEVER ask about

- Protected characteristics  
- Medical status  
- Family/marital status (unless personal scenario explicitly about that)  
- Religion, political affiliation  
- Anything outside scenario scope  

---

## System must ALWAYS

- Display AI disclosure before every session  
- Require explicit consent for transcript capture  
- Allow full data deletion  
- Show "This is a simulation based on public information" for real public figures  
- Frame personal scenarios as communication practice, never manipulation  
- Use only observable conversation behavior with transcript evidence  

---

## Code Validation

After every AI response, scan for forbidden phrases. Examples:

- `should be hired` / `should not be hired`  
- `is dishonest` / `lacks intelligence`  
- `based on your accent` / `culture fit`  
- Protected characteristic references  

If found: **regenerate or block** before saving to database.

Implement in `lib/schemas.ts` (`EvaluationSchema` refine) and post-processing in `lib/evaluator.ts`.
