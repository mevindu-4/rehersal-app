-- Rehearsal initial schema
CREATE EXTENSION IF NOT EXISTS vector;

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  stripe_customer_id TEXT,
  avatar_minutes_budget INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('owner', 'coach', 'learner', 'reviewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, org_id)
);

CREATE TABLE target_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  domain TEXT,
  source_urls JSONB DEFAULT '[]'::jsonb,
  raw_content TEXT,
  personality_json JSONB,
  reconstruction_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (reconstruction_status IN ('pending', 'processing', 'complete', 'failed')),
  reconstruction_error TEXT,
  is_public_figure BOOLEAN NOT NULL DEFAULT FALSE,
  is_library BOOLEAN NOT NULL DEFAULT FALSE,
  accuracy_rating FLOAT,
  session_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE target_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_profile_id UUID NOT NULL REFERENCES target_profiles(id) ON DELETE CASCADE,
  url TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'linkedin', 'twitter', 'podcast', 'article', 'youtube', 'document', 'manual'
  )),
  raw_text TEXT,
  scraped_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'failed'))
);

CREATE TABLE user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'txt')),
  extracted_text TEXT,
  doc_type TEXT NOT NULL DEFAULT 'other' CHECK (doc_type IN (
    'my_background', 'opportunity', 'company', 'product', 'prior_interactions', 'other'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_document_id UUID NOT NULL REFERENCES user_documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  conversation_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  difficulty INTEGER NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  goal TEXT,
  target_profile_id UUID REFERENCES target_profiles(id),
  is_template BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id),
  target_profile_id UUID REFERENCES target_profiles(id),
  bey_call_id TEXT,
  bey_agent_id TEXT,
  join_url TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN (
    'created', 'ready', 'live', 'ended', 'evaluating', 'report_ready', 'failed'
  )),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE session_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('user', 'avatar')),
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sequence INTEGER NOT NULL
);

CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  target_fit_score INTEGER CHECK (target_fit_score BETWEEN 0 AND 100),
  rubric_scores_json JSONB,
  missed_signals_json JSONB,
  evaluator_model TEXT,
  confidence TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE feedback_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  report_json JSONB NOT NULL,
  pdf_url TEXT,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accuracy_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  target_profile_id UUID NOT NULL REFERENCES target_profiles(id),
  user_id UUID NOT NULL REFERENCES users(id),
  accuracy_score INTEGER NOT NULL CHECK (accuracy_score BETWEEN 1 AND 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES users(id),
  learner_id UUID NOT NULL REFERENCES users(id),
  scenario_id UUID NOT NULL REFERENCES scenarios(id),
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coach_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES feedback_reports(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES users(id),
  turn_id UUID REFERENCES session_turns(id),
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public_figure_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  domain TEXT,
  tags TEXT[] DEFAULT '{}',
  profile_json JSONB NOT NULL,
  source_urls JSONB DEFAULT '[]'::jsonb,
  accuracy_rating FLOAT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  submitted_by UUID REFERENCES users(id),
  moderation_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before_json JSONB,
  after_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_org ON memberships(org_id);
CREATE INDEX idx_target_profiles_org ON target_profiles(org_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_org ON sessions(org_id);
CREATE INDEX idx_document_chunks_doc ON document_chunks(user_document_id);

-- Helper: org IDs for current user
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM memberships WHERE user_id = auth.uid();
$$;

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE accuracy_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_figure_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users: own row only
CREATE POLICY users_select ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_update ON users FOR UPDATE USING (id = auth.uid());

-- Organizations: members only
CREATE POLICY orgs_select ON organizations FOR SELECT
  USING (id IN (SELECT user_org_ids()));
CREATE POLICY orgs_update ON organizations FOR UPDATE
  USING (id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid() AND role = 'owner'));

-- Memberships
CREATE POLICY memberships_select ON memberships FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));

-- Target profiles
CREATE POLICY target_profiles_all ON target_profiles FOR ALL
  USING (org_id IN (SELECT user_org_ids()))
  WITH CHECK (org_id IN (SELECT user_org_ids()));

-- Target sources (via profile org)
CREATE POLICY target_sources_all ON target_sources FOR ALL
  USING (
    target_profile_id IN (
      SELECT id FROM target_profiles WHERE org_id IN (SELECT user_org_ids())
    )
  );

-- User documents
CREATE POLICY user_documents_all ON user_documents FOR ALL
  USING (org_id IN (SELECT user_org_ids()))
  WITH CHECK (org_id IN (SELECT user_org_ids()) AND user_id = auth.uid());

-- Document chunks
CREATE POLICY document_chunks_all ON document_chunks FOR ALL
  USING (
    user_document_id IN (
      SELECT id FROM user_documents WHERE org_id IN (SELECT user_org_ids())
    )
  );

-- Scenarios
CREATE POLICY scenarios_all ON scenarios FOR ALL
  USING (org_id IN (SELECT user_org_ids()))
  WITH CHECK (org_id IN (SELECT user_org_ids()));

-- Sessions
CREATE POLICY sessions_all ON sessions FOR ALL
  USING (org_id IN (SELECT user_org_ids()))
  WITH CHECK (org_id IN (SELECT user_org_ids()) AND user_id = auth.uid());

-- Session turns
CREATE POLICY session_turns_all ON session_turns FOR ALL
  USING (
    session_id IN (SELECT id FROM sessions WHERE org_id IN (SELECT user_org_ids()))
  );

-- Evaluations & reports
CREATE POLICY evaluations_all ON evaluations FOR ALL
  USING (
    session_id IN (SELECT id FROM sessions WHERE org_id IN (SELECT user_org_ids()))
  );

CREATE POLICY feedback_reports_all ON feedback_reports FOR ALL
  USING (
    session_id IN (SELECT id FROM sessions WHERE org_id IN (SELECT user_org_ids()))
  );

-- Accuracy ratings
CREATE POLICY accuracy_ratings_all ON accuracy_ratings FOR ALL
  USING (user_id = auth.uid());

-- Assignments
CREATE POLICY assignments_all ON assignments FOR ALL
  USING (org_id IN (SELECT user_org_ids()));

-- Coach comments
CREATE POLICY coach_comments_all ON coach_comments FOR ALL
  USING (
    report_id IN (
      SELECT fr.id FROM feedback_reports fr
      JOIN sessions s ON s.id = fr.session_id
      WHERE s.org_id IN (SELECT user_org_ids())
    )
  );

-- Public library: read all approved
CREATE POLICY library_select ON public_figure_library FOR SELECT
  USING (moderation_status = 'approved');

-- Usage events
CREATE POLICY usage_events_all ON usage_events FOR ALL
  USING (org_id IN (SELECT user_org_ids()));

-- Audit logs: coaches and owners
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid()
        AND m.role IN ('owner', 'coach')
        AND m.org_id IN (SELECT user_org_ids())
    )
  );
