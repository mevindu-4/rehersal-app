import { z } from "zod";

export const personalityProfileSchema = z.object({
  name: z.string(),
  communication_style: z.object({
    directness: z.string(),
    formality: z.string(),
    pace: z.string(),
    listening_style: z.string(),
  }),
  core_values: z.array(z.string()),
  typical_question_patterns: z.array(z.string()),
  known_priorities: z.array(z.string()),
  known_skepticisms: z.array(z.string()),
  what_impresses_them: z.array(z.string()),
  what_irritates_them: z.array(z.string()),
  expertise_areas: z.array(z.string()),
  behavioral_signals: z.array(z.string()),
  inferred_concerns_by_context: z.object({
    interview: z.array(z.string()),
    fundraising: z.array(z.string()),
    sales: z.array(z.string()),
    negotiation: z.array(z.string()),
  }),
  source_citations: z.record(z.string()),
  confidence: z.record(z.enum(["high", "medium", "low"])),
});

export const evaluationSchema = z.object({
  overall_score: z.number().min(0).max(100),
  target_fit_score: z.number().min(0).max(100),
  confidence: z.enum(["high", "medium", "low"]),
  summary: z.string(),
  rubric_scores: z.array(
    z.object({
      criterion: z.string(),
      score: z.number(),
      max_score: z.number(),
      evidence: z.string(),
      improvement: z.string(),
    })
  ),
  best_moments: z.array(
    z.object({
      timestamp: z.string(),
      note: z.string(),
      why_it_worked_for_target: z.string(),
    })
  ),
  weak_moments: z.array(
    z.object({
      timestamp: z.string(),
      note: z.string(),
      why_it_matters_for_target: z.string(),
    })
  ),
  missed_signals: z.array(
    z.object({
      timestamp: z.string(),
      signal: z.string(),
      what_it_likely_meant: z.string(),
    })
  ),
  suggested_answers: z.array(
    z.object({
      moment_timestamp: z.string(),
      original: z.string(),
      stronger_version: z.string(),
      grounded_in: z.string(),
    })
  ),
  communication_notes: z.object({
    filler_word_count: z.number(),
    directness_score: z.number(),
    structure_score: z.number(),
    clarity_score: z.number(),
  }),
  next_practice: z.string(),
});

export const createTargetSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  company: z.string().optional(),
  domain: z.string().optional(),
});

export const addSourceSchema = z.object({
  url: z.string().url().optional(),
  source_type: z.enum([
    "linkedin",
    "twitter",
    "podcast",
    "article",
    "youtube",
    "document",
    "manual",
  ]),
  raw_text: z.string().optional(),
});

export const createScenarioSchema = z.object({
  title: z.string().min(1),
  conversation_type: z.string(),
  duration_minutes: z.number().min(5).max(30),
  difficulty: z.number().min(1).max(5),
  goal: z.string().optional(),
  target_profile_id: z.string().uuid().optional(),
});

export const createSessionSchema = z.object({
  scenarioId: z.string().uuid(),
  targetProfileId: z.string().uuid(),
});

export const accuracyRatingSchema = z.object({
  accuracy_score: z.number().min(1).max(5),
  feedback_text: z.string().optional(),
});
