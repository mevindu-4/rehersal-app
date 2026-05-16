-- Migration 001: Initial Schema for Rehearsal

-- Enums
CREATE TYPE org_mode AS ENUM ('solo', 'team');
CREATE TYPE membership_role AS ENUM ('owner', 'coach', 'learner', 'reviewer');
CREATE TYPE target_domain AS ENUM ('interview', 'fundraising', 'sales', 'negotiation', 'personal', 'other');
CREATE TYPE target_status AS ENUM ('pending', 'reconstructing', 'complete', 'failed');
CREATE TYPE source_type AS ENUM ('url', 'document', 'manual');
CREATE TYPE source_status AS ENUM ('pending', 'scraping', 'success', 'failed', 'needs_manual');
CREATE TYPE file_type AS ENUM ('pdf', 'docx', 'txt');
CREATE TYPE doc_type AS ENUM ('my_background', 'opportunity', 'company_product', 'prior_interactions', 'other');
CREATE TYPE embedding_status AS ENUM ('pending', 'processing', 'complete', 'failed');
CREATE TYPE conversation_type AS ENUM (
  'job_interview', 'fundraising_pitch', 'sales_discovery', 'difficult_conversation',
  'negotiation', 'deposition_legal', 'media_podcast', 'board_meeting',
  'personal_conversation', 'custom'
);
CREATE TYPE session_status AS ENUM (
  'created', 'ready', 'live', 'ended', 'evaluating', 'report_ready', 'failed'
);
CREATE TYPE session_speaker AS ENUM ('user', 'avatar');
CREATE TYPE eval_confidence AS ENUM ('high', 'medium', 'low');
CREATE TYPE assignment_status AS ENUM ('pending', 'completed', 'overdue');
CREATE TYPE library_category AS ENUM ('professional', 'personal', 'real_figure');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected');

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  mode org_mode NOT NULL DEFAULT 'solo',
  avatar_minutes_used INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  default_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Memberships
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role membership_role NOT NULL DEFAULT 'learner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

-- Target profiles
CREATE TABLE target_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  domain target_domain NOT NULL DEFAULT 'other',
  tags TEXT[] NOT NULL DEFAULT '{}',
  personality_json JSONB,
  avatar_brief_template TEXT,
  is_library BOOLEAN NOT NULL DEFAULT false,
  is_public_figure BOOLEAN NOT NULL DEFAULT false,
  is_shared_with_team BOOLEAN NOT NULL DEFAULT false,
  source_count INT NOT NULL DEFAULT 0,
  session_count INT NOT NULL DEFAULT 0,
  accuracy_rating NUMERIC,
  status target_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User documents
CREATE TABLE user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes INT NOT NULL,
  file_type file_type NOT NULL,
  extracted_text TEXT,
  doc_type doc_type NOT NULL DEFAULT 'other',
  is_company_shared BOOLEAN NOT NULL DEFAULT false,
  embedding_status embedding_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Target sources
CREATE TABLE target_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_profile_id UUID NOT NULL REFERENCES target_profiles(id) ON DELETE CASCADE,
  source_type source_type NOT NULL,
  url TEXT,
  document_id UUID REFERENCES user_documents(id) ON DELETE SET NULL,
  manual_text TEXT,
  raw_text TEXT,
  title TEXT,
  status source_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document chunks (embedding added in 003)
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_document_id UUID NOT NULL REFERENCES user_documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scenarios
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  conversation_type conversation_type NOT NULL,
  target_profile_id UUID NOT NULL REFERENCES target_profiles(id) ON DELETE CASCADE,
  duration_minutes INT NOT NULL DEFAULT 15,
  difficulty INT NOT NULL DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
  goal TEXT NOT NULL,
  included_document_ids UUID[] NOT NULL DEFAULT '{}',
  is_template BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  target_profile_id UUID NOT NULL REFERENCES target_profiles(id) ON DELETE CASCADE,
  assignment_id UUID,
  bey_call_id TEXT,
  bey_agent_id TEXT,
  join_url TEXT,
  system_prompt_used TEXT,
  status session_status NOT NULL DEFAULT 'created',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session turns
CREATE TABLE session_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  speaker session_speaker NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  sequence INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX session_turns_session_sequence_idx ON session_turns (session_id, sequence);

-- Evaluations
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  overall_score INT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  target_fit_score INT NOT NULL CHECK (target_fit_score >= 0 AND target_fit_score <= 100),
  rubric_scores_json JSONB NOT NULL DEFAULT '[]',
  missed_signals_json JSONB NOT NULL DEFAULT '[]',
  confidence eval_confidence NOT NULL DEFAULT 'medium',
  evaluator_model TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feedback reports
CREATE TABLE feedback_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  report_json JSONB NOT NULL,
  pdf_url TEXT,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accuracy ratings
CREATE TABLE accuracy_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  target_profile_id UUID NOT NULL REFERENCES target_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accuracy_score INT NOT NULL CHECK (accuracy_score >= 1 AND accuracy_score <= 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  message TEXT,
  status assignment_status NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK for sessions.assignment_id after assignments exists
ALTER TABLE sessions
  ADD CONSTRAINT sessions_assignment_id_fkey
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL;

-- Coach comments
CREATE TABLE coach_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES feedback_reports(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  turn_sequence INT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public figure library
CREATE TABLE public_figure_library (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  domain target_domain NOT NULL,
  category library_category NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  profile_json JSONB NOT NULL,
  avatar_brief_template TEXT NOT NULL,
  source_urls TEXT[] NOT NULL DEFAULT '{}',
  usage_count INT NOT NULL DEFAULT 0,
  accuracy_rating NUMERIC,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  moderation_status moderation_status NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage events
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER target_profiles_updated_at BEFORE UPDATE ON target_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_documents_updated_at BEFORE UPDATE ON user_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER scenarios_updated_at BEFORE UPDATE ON scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER feedback_reports_updated_at BEFORE UPDATE ON feedback_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER public_figure_library_updated_at BEFORE UPDATE ON public_figure_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
