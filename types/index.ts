export type MembershipRole = "owner" | "coach" | "learner" | "reviewer";
export type OrgPlan = "free" | "pro" | "team" | "enterprise";
export type ConversationType =
  | "job_interview"
  | "fundraising"
  | "sales_discovery"
  | "difficult_conversation"
  | "negotiation"
  | "deposition"
  | "media_interview"
  | "board_meeting"
  | "custom";

export type SessionStatus =
  | "created"
  | "ready"
  | "live"
  | "ended"
  | "evaluating"
  | "report_ready"
  | "failed";

export type ReconstructionStatus =
  | "pending"
  | "processing"
  | "complete"
  | "failed";

export type SourceType =
  | "linkedin"
  | "twitter"
  | "podcast"
  | "article"
  | "youtube"
  | "document"
  | "manual";

export type DocType =
  | "my_background"
  | "opportunity"
  | "company"
  | "product"
  | "prior_interactions"
  | "other";

export interface PersonalityProfile {
  name: string;
  communication_style: {
    directness: string;
    formality: string;
    pace: string;
    listening_style: string;
  };
  core_values: string[];
  typical_question_patterns: string[];
  known_priorities: string[];
  known_skepticisms: string[];
  what_impresses_them: string[];
  what_irritates_them: string[];
  expertise_areas: string[];
  behavioral_signals: string[];
  inferred_concerns_by_context: {
    interview: string[];
    fundraising: string[];
    sales: string[];
    negotiation: string[];
  };
  source_citations: Record<string, string>;
  confidence: Record<string, "high" | "medium" | "low">;
}

export interface EvaluationResult {
  overall_score: number;
  target_fit_score: number;
  confidence: "high" | "medium" | "low";
  summary: string;
  rubric_scores: Array<{
    criterion: string;
    score: number;
    max_score: number;
    evidence: string;
    improvement: string;
  }>;
  best_moments: Array<{
    timestamp: string;
    note: string;
    why_it_worked_for_target: string;
  }>;
  weak_moments: Array<{
    timestamp: string;
    note: string;
    why_it_matters_for_target: string;
  }>;
  missed_signals: Array<{
    timestamp: string;
    signal: string;
    what_it_likely_meant: string;
  }>;
  suggested_answers: Array<{
    moment_timestamp: string;
    original: string;
    stronger_version: string;
    grounded_in: string;
  }>;
  communication_notes: {
    filler_word_count: number;
    directness_score: number;
    structure_score: number;
    clarity_score: number;
  };
  next_practice: string;
}

export interface FeedbackReportJson extends EvaluationResult {
  target_name: string;
  session_date: string;
  conversation_type: string;
  transcript: Array<{
    speaker: "user" | "avatar";
    message: string;
    sent_at: string;
    sequence: number;
  }>;
}

export interface Database {
  public: {
    Tables: Record<string, unknown>;
  };
}
