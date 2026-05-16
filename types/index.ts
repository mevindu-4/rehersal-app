// ─── Enums & Literals ─────────────────────────────────────────────────────────

export type Mode = "solo" | "team";
export type Role = "owner" | "coach" | "learner" | "reviewer";

export type Domain =
  | "interview"
  | "fundraising"
  | "sales"
  | "negotiation"
  | "personal"
  | "other";

export type TargetStatus = "pending" | "reconstructing" | "complete" | "failed";

export type SourceType = "url" | "document" | "manual";
export type SourceStatus =
  | "pending"
  | "scraping"
  | "success"
  | "failed"
  | "needs_manual";

export type DocType =
  | "my_background"
  | "opportunity"
  | "company_product"
  | "prior_interactions"
  | "other";

export type FileType = "pdf" | "docx" | "txt";
export type EmbeddingStatus = "pending" | "processing" | "complete" | "failed";

export type ConversationType =
  | "job_interview"
  | "fundraising_pitch"
  | "sales_discovery"
  | "difficult_conversation"
  | "negotiation"
  | "deposition_legal"
  | "media_podcast"
  | "board_meeting"
  | "personal_conversation"
  | "custom";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type SessionStatus =
  | "created"
  | "ready"
  | "live"
  | "ended"
  | "evaluating"
  | "report_ready"
  | "failed";

export type Speaker = "user" | "avatar";

export type ConfidenceLevel = "high" | "medium" | "low";

export type AssignmentStatus = "pending" | "completed" | "overdue";

export type LibraryCategory = "professional" | "personal" | "real_figure";
export type ModerationStatus = "pending" | "approved" | "rejected";

// ─── Personality JSON ─────────────────────────────────────────────────────────

export interface CommunicationStyle {
  directness: string;
  formality: string;
  pace: string;
  listening_style: string;
}

export interface PersonalityJSON {
  communication_style: CommunicationStyle;
  core_values: string[];
  typical_question_patterns: string[];
  known_priorities: string[];
  known_skepticisms: string[];
  what_impresses_them: string[];
  what_irritates_them: string[];
  expertise_areas: string[];
  behavioral_signals: string[];
  inferred_concerns_by_context: Partial<Record<ConversationType, string[]>>;
  source_citations: Record<string, string>;
  confidence: Record<string, ConfidenceLevel>;
}

// ─── Database Tables ──────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  mode: Mode;
  plan?: string;
  avatar_minutes_used: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  default_org_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  org_id: string;
  user_id: string;
  role: Role;
  created_at: string;
}

export interface TargetProfile {
  id: string;
  org_id: string;
  created_by: string;
  name: string;
  title: string | null;
  company: string | null;
  domain: Domain;
  tags: string[];
  personality_json: PersonalityJSON | null;
  avatar_brief_template: string | null;
  is_library: boolean;
  is_public_figure: boolean;
  is_shared_with_team: boolean;
  source_count: number;
  session_count: number;
  accuracy_rating: number | null;
  status: TargetStatus;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TargetSource {
  id: string;
  target_profile_id: string;
  source_type: SourceType;
  url: string | null;
  document_id: string | null;
  manual_text: string | null;
  raw_text: string | null;
  title: string | null;
  status: SourceStatus;
  error_message: string | null;
  scraped_at: string | null;
  created_at: string;
}

export interface UserDocument {
  id: string;
  org_id: string;
  user_id: string;
  filename: string;
  file_url: string;
  file_size_bytes: number;
  file_type: FileType;
  extracted_text: string | null;
  doc_type: DocType;
  is_company_shared: boolean;
  embedding_status: EmbeddingStatus;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  user_document_id: string;
  chunk_text: string;
  embedding: number[];
  chunk_index: number;
  created_at: string;
}

export interface Scenario {
  id: string;
  org_id: string;
  created_by: string;
  title: string;
  conversation_type: ConversationType;
  target_profile_id: string;
  duration_minutes: number;
  difficulty: Difficulty;
  goal: string;
  included_document_ids: string[];
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  org_id: string;
  user_id: string;
  scenario_id: string;
  target_profile_id: string;
  assignment_id: string | null;
  bey_call_id: string | null;
  bey_agent_id: string | null;
  join_url: string | null;
  system_prompt_used: string | null;
  status: SessionStatus;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionTurn {
  id: string;
  session_id: string;
  speaker: Speaker;
  message: string;
  sent_at: string;
  sequence: number;
  created_at: string;
}

export interface RubricScore {
  dimension: string;
  score: number;
  evidence: string;
}

export interface MissedSignal {
  timestamp: string;
  avatar_signal: string;
  likely_meaning: string;
}

export interface Evaluation {
  id: string;
  session_id: string;
  overall_score: number;
  target_fit_score: number;
  rubric_scores_json: RubricScore[];
  missed_signals_json: MissedSignal[];
  confidence: ConfidenceLevel;
  evaluator_model: string;
  prompt_version: string;
  created_at: string;
}

export interface KeyMoment {
  timestamp: string;
  user_said: string;
  reason: string;
  sequence?: number;
}

export interface SuggestedAnswer {
  timestamp: string;
  original: string;
  suggested: string;
  rationale: string;
}

export interface CommunicationNotes {
  filler_words_count: number;
  directness: number;
  structure: number;
  clarity: number;
}

export interface ReportSection {
  type: string;
  content: string;
}

export interface FeedbackReportJSON {
  executive_summary: string;
  best_moments: KeyMoment[];
  weak_moments: KeyMoment[];
  missed_signals: MissedSignal[];
  suggested_answers: SuggestedAnswer[];
  communication_notes: CommunicationNotes;
  overall_score: number;
  target_fit_score: number;
  conversation_type: ConversationType;
  target_name: string;
  session_date: string;
}

export interface FeedbackReport {
  id: string;
  session_id: string;
  report_json: FeedbackReportJSON;
  pdf_url: string | null;
  viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccuracyRating {
  id: string;
  session_id: string;
  target_profile_id: string;
  user_id: string;
  accuracy_score: number;
  feedback_text: string | null;
  created_at: string;
}

export interface Assignment {
  id: string;
  org_id: string;
  coach_id: string;
  learner_id: string;
  scenario_id: string;
  due_date: string | null;
  message: string | null;
  status: AssignmentStatus;
  completed_at: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachComment {
  id: string;
  report_id: string;
  session_id: string;
  coach_id: string;
  turn_sequence: number | null;
  comment_text: string;
  created_at: string;
}

export interface LibraryProfile {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  domain: Domain;
  category: LibraryCategory;
  tags: string[];
  profile_json: PersonalityJSON;
  avatar_brief_template: string;
  source_urls: string[];
  usage_count: number;
  accuracy_rating: number | null;
  is_featured: boolean;
  submitted_by: string | null;
  moderation_status: ModerationStatus;
  created_at: string;
  updated_at: string;
}

export interface UsageEvent {
  id: string;
  org_id: string;
  user_id: string;
  event_type: string;
  quantity: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── Beyond Presence ───────────────────────────────────────────────────────────

export interface BeyCall {
  id: string;
  join_url: string;
  livekit_url?: string;
  livekit_token?: string;
  agent_id: string;
}

export interface BeyMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// ─── Scraper ──────────────────────────────────────────────────────────────────

export interface ScrapeResult {
  status: "success" | "failed" | "needs_manual";
  text?: string;
  title?: string;
  message?: string;
}

// ─── API Request / Response Types ─────────────────────────────────────────────

export interface CreateTargetRequest {
  name: string;
  title?: string;
  company?: string;
  domain: Domain;
  tags?: string[];
}

export interface CreateTargetResponse {
  target: TargetProfile;
}

export interface UpdateTargetRequest {
  name?: string;
  title?: string;
  company?: string;
  domain?: Domain;
  tags?: string[];
  personality_json?: PersonalityJSON;
  avatar_brief_template?: string;
  is_shared_with_team?: boolean;
}

export interface AddSourceRequest {
  source_type: SourceType;
  url?: string;
  document_id?: string;
  manual_text?: string;
  title?: string;
}

export interface CreateDocumentRequest {
  filename: string;
  file_url: string;
  file_size_bytes: number;
  file_type: FileType;
  doc_type: DocType;
  is_company_shared?: boolean;
}

export interface CreateScenarioRequest {
  title: string;
  conversation_type: ConversationType;
  target_profile_id: string;
  duration_minutes: number;
  difficulty: Difficulty;
  goal: string;
  included_document_ids?: string[];
  is_template?: boolean;
}

export interface CreateSessionRequest {
  scenario_id: string;
  assignment_id?: string;
}

export interface CreateSessionResponse {
  session: Session;
  join_url: string;
}

export interface CreateAssignmentRequest {
  learner_ids: string[];
  scenario_id: string;
  due_date?: string;
  message?: string;
}

export interface RateAccuracyRequest {
  accuracy_score: number;
  feedback_text?: string;
}

export interface CoachCommentRequest {
  report_id: string;
  session_id: string;
  turn_sequence?: number;
  comment_text: string;
}

export interface LibraryBrowseParams {
  category?: LibraryCategory;
  domain?: Domain;
  search?: string;
  sort?: "most_used" | "highest_rated" | "newest";
  featured?: boolean;
}

export interface ApiError {
  error: string;
  code?: string;
}

// ─── UI Props (selected) ───────────────────────────────────────────────────────

export interface TargetCardProps {
  target: TargetProfile;
  onLaunch?: (id: string) => void;
}

export interface ScenarioCardProps {
  scenario: Scenario;
  target?: TargetProfile;
}

export interface PersonalityProfileCardProps {
  personality: PersonalityJSON;
  editable?: boolean;
  onEdit?: (personality: PersonalityJSON) => void;
}

export interface ScoreGaugeProps {
  score: number;
  label: string;
  color?: "amber" | "sage";
  size?: "sm" | "lg";
}

export interface SessionHistoryItem {
  session: Session;
  scenario?: Scenario;
  target?: TargetProfile;
  evaluation?: Evaluation;
}
