import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const ModeSchema = z.enum(["solo", "team"]);
export const RoleSchema = z.enum(["owner", "coach", "learner", "reviewer"]);
export const DomainSchema = z.enum([
  "interview",
  "fundraising",
  "sales",
  "negotiation",
  "personal",
  "other",
]);
export const TargetStatusSchema = z.enum([
  "pending",
  "reconstructing",
  "complete",
  "failed",
]);
export const SourceTypeSchema = z.enum(["url", "document", "manual"]);
export const SourceStatusSchema = z.enum([
  "pending",
  "scraping",
  "success",
  "failed",
  "needs_manual",
]);
export const DocTypeSchema = z.enum([
  "my_background",
  "opportunity",
  "company_product",
  "prior_interactions",
  "other",
]);
export const FileTypeSchema = z.enum(["pdf", "docx", "txt"]);
export const EmbeddingStatusSchema = z.enum([
  "pending",
  "processing",
  "complete",
  "failed",
]);
export const ConversationTypeSchema = z.enum([
  "job_interview",
  "fundraising_pitch",
  "sales_discovery",
  "difficult_conversation",
  "negotiation",
  "deposition_legal",
  "media_podcast",
  "board_meeting",
  "personal_conversation",
  "custom",
]);
export const DifficultySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
export const SessionStatusSchema = z.enum([
  "created",
  "ready",
  "live",
  "ended",
  "evaluating",
  "report_ready",
  "failed",
]);
export const ConfidenceLevelSchema = z.enum(["high", "medium", "low"]);
export const AssignmentStatusSchema = z.enum([
  "pending",
  "completed",
  "overdue",
]);
export const LibraryCategorySchema = z.enum([
  "professional",
  "personal",
  "real_figure",
]);

// ─── Personality JSON ───────────────────────────────────────────────────────

export const CommunicationStyleSchema = z.object({
  directness: z.string(),
  formality: z.string(),
  pace: z.string(),
  listening_style: z.string(),
});

export const PersonalityJSONSchema = z.object({
  communication_style: CommunicationStyleSchema,
  core_values: z.array(z.string()),
  typical_question_patterns: z.array(z.string()),
  known_priorities: z.array(z.string()),
  known_skepticisms: z.array(z.string()),
  what_impresses_them: z.array(z.string()),
  what_irritates_them: z.array(z.string()),
  expertise_areas: z.array(z.string()),
  behavioral_signals: z.array(z.string()),
  inferred_concerns_by_context: z.record(z.string(), z.array(z.string())),
  source_citations: z.record(z.string(), z.string()),
  confidence: z.record(z.string(), ConfidenceLevelSchema),
});

// ─── Evaluation & Report ────────────────────────────────────────────────────

export const RubricScoreSchema = z.object({
  dimension: z.string(),
  score: z.number().min(0).max(100),
  evidence: z.string(),
});

export const KeyMomentSchema = z.object({
  timestamp: z.string(),
  user_said: z.string(),
  reason: z.string(),
  sequence: z.number().optional(),
});

export const MissedSignalSchema = z.object({
  timestamp: z.string(),
  avatar_signal: z.string(),
  likely_meaning: z.string(),
});

export const SuggestedAnswerSchema = z.object({
  timestamp: z.string(),
  original: z.string(),
  suggested: z.string(),
  rationale: z.string(),
});

export const CommunicationNotesSchema = z.object({
  filler_words_count: z.number().min(0),
  directness: z.number().min(0).max(10),
  structure: z.number().min(0).max(10),
  clarity: z.number().min(0).max(10),
});

export const EvaluationSchema = z
  .object({
    overall_score: z.number().min(0).max(100),
    target_fit_score: z.number().min(0).max(100),
    confidence: ConfidenceLevelSchema,
    summary: z.string(),
    rubric_scores: z.array(RubricScoreSchema),
    best_moments: z.array(KeyMomentSchema),
    weak_moments: z.array(KeyMomentSchema),
    missed_signals: z.array(MissedSignalSchema),
    suggested_answers: z.array(SuggestedAnswerSchema),
    communication_notes: CommunicationNotesSchema,
  })
  .superRefine((data, ctx) => {
    const { safe, matches } = validateAISafety(JSON.stringify(data));
    if (!safe) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Evaluation contains forbidden language: ${matches.join(", ")}`,
      });
    }
  });

export const FeedbackReportSchema = z.object({
  executive_summary: z.string(),
  best_moments: z.array(KeyMomentSchema),
  weak_moments: z.array(KeyMomentSchema),
  missed_signals: z.array(MissedSignalSchema),
  suggested_answers: z.array(SuggestedAnswerSchema),
  communication_notes: CommunicationNotesSchema,
  overall_score: z.number().min(0).max(100),
  target_fit_score: z.number().min(0).max(100),
  conversation_type: ConversationTypeSchema,
  target_name: z.string(),
  session_date: z.string(),
});

// ─── Target & Sources ───────────────────────────────────────────────────────

export const TargetSourceSchema = z.object({
  source_type: SourceTypeSchema,
  url: z.string().url().optional(),
  document_id: z.string().uuid().optional(),
  manual_text: z.string().optional(),
  title: z.string().optional(),
});

export const CreateTargetSchema = z.object({
  name: z.string().min(1).max(200),
  title: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  domain: DomainSchema,
  tags: z.array(z.string()).optional(),
});

export const UpdateTargetSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  title: z.string().max(200).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  domain: DomainSchema.optional(),
  tags: z.array(z.string()).optional(),
  personality_json: PersonalityJSONSchema.optional(),
  avatar_brief_template: z.string().optional(),
  is_shared_with_team: z.boolean().optional(),
});

export const AddSourceSchema = TargetSourceSchema.refine(
  (data) => {
    if (data.source_type === "url") return !!data.url;
    if (data.source_type === "document") return !!data.document_id;
    if (data.source_type === "manual") return !!data.manual_text;
    return false;
  },
  { message: "Source must include url, document_id, or manual_text" }
);

// ─── Documents ──────────────────────────────────────────────────────────────

export const EmbedDocumentSchema = z.object({
  document_id: z.string().uuid().optional(),
});

export const CreateDocumentSchema = z.object({
  filename: z.string().min(1),
  file_url: z.string().url(),
  file_size_bytes: z.number().positive(),
  file_type: FileTypeSchema,
  doc_type: DocTypeSchema,
  is_company_shared: z.boolean().optional(),
});

// ─── Scenarios ────────────────────────────────────────────────────────────────

export const ScenarioConfigSchema = z.object({
  title: z.string().min(1).max(200),
  conversation_type: ConversationTypeSchema,
  target_profile_id: z.string().uuid(),
  duration_minutes: z.number().min(5).max(30).multipleOf(5),
  difficulty: DifficultySchema,
  goal: z.string().min(10).max(5000),
  included_document_ids: z.array(z.string().uuid()).optional(),
  is_template: z.boolean().optional(),
});

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const CreateSessionSchema = z.object({
  scenario_id: z.string().uuid(),
  assignment_id: z.string().uuid().optional(),
});

// ─── Assignments ──────────────────────────────────────────────────────────────

export const CreateAssignmentSchema = z.object({
  learner_ids: z.array(z.string().uuid()).min(1),
  scenario_id: z.string().uuid(),
  due_date: z.string().datetime().optional(),
  message: z.string().max(1000).optional(),
});

// ─── Ratings & Comments ───────────────────────────────────────────────────────

export const RateAccuracySchema = z.object({
  accuracy_score: z.number().min(1).max(5),
  feedback_text: z.string().max(2000).optional(),
});

export const CoachCommentSchema = z.object({
  report_id: z.string().uuid(),
  session_id: z.string().uuid(),
  turn_sequence: z.number().optional(),
  comment_text: z.string().min(1).max(2000),
});

// ─── Library ──────────────────────────────────────────────────────────────────

export const LibraryProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  domain: DomainSchema,
  category: LibraryCategorySchema,
  tags: z.array(z.string()),
  profile_json: PersonalityJSONSchema,
  avatar_brief_template: z.string(),
  source_urls: z.array(z.string()),
  is_featured: z.boolean().optional(),
});

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const OnboardingSchema = z.object({
  intent: z.enum(["solo", "team"]),
  workspace_name: z.string().min(1).max(100),
  primary_use_case: z.string(),
  starter_target_id: z.string().optional(),
  invite_emails: z
    .array(
      z.object({
        email: z.string().email(),
        role: RoleSchema,
      })
    )
    .max(5)
    .optional(),
});

export const UpdateSettingsSchema = z.object({
  workspace_name: z.string().min(1).max(100),
});

export const TeamInviteSchema = z.object({
  email: z.string().email(),
  role: RoleSchema,
});

// ─── Safety validation ────────────────────────────────────────────────────────

const FORBIDDEN_PHRASES = [
  "should be hired",
  "should not be hired",
  "no hire",
  "is dishonest",
  "lacks intelligence",
  "based on your accent",
  "culture fit",
  "hireability",
  "mental health",
  "personality disorder",
];

export function containsForbiddenLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_PHRASES.some((phrase) => lower.includes(phrase));
}

export function validateAISafety(text: string): { safe: boolean; matches: string[] } {
  const lower = text.toLowerCase();
  const matches = FORBIDDEN_PHRASES.filter((phrase) => lower.includes(phrase));
  return { safe: matches.length === 0, matches };
}
