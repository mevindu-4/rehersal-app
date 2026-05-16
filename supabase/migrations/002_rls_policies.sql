-- Migration 002: Row Level Security Policies

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
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

-- Helper: user is member of org
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE org_id = check_org_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: user has coach/admin role in org
CREATE OR REPLACE FUNCTION is_org_coach_or_admin(check_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE org_id = check_org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'coach')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations
CREATE POLICY "Members can view their orgs"
  ON organizations FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "Owners can update their orgs"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE org_id = organizations.id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- Users
CREATE POLICY "Users can view themselves"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can view org members"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships m1
      JOIN memberships m2 ON m1.org_id = m2.org_id
      WHERE m1.user_id = auth.uid() AND m2.user_id = users.id
    )
  );

CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Memberships
CREATE POLICY "Members can view org memberships"
  ON memberships FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Owners can manage memberships"
  ON memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.org_id = memberships.org_id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
    )
  );

-- Target profiles
CREATE POLICY "Org members can view targets"
  ON target_profiles FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Org members can create targets"
  ON target_profiles FOR INSERT
  WITH CHECK (is_org_member(org_id) AND created_by = auth.uid());

CREATE POLICY "Creators and coaches can update targets"
  ON target_profiles FOR UPDATE
  USING (
    is_org_member(org_id)
    AND (created_by = auth.uid() OR is_org_coach_or_admin(org_id))
  );

CREATE POLICY "Creators and coaches can delete targets"
  ON target_profiles FOR DELETE
  USING (
    is_org_member(org_id)
    AND (created_by = auth.uid() OR is_org_coach_or_admin(org_id))
  );

-- Target sources (via target ownership)
CREATE POLICY "Org members can manage target sources"
  ON target_sources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM target_profiles tp
      WHERE tp.id = target_sources.target_profile_id
        AND is_org_member(tp.org_id)
    )
  );

-- User documents
CREATE POLICY "Users can view own and company docs"
  ON user_documents FOR SELECT
  USING (
    is_org_member(org_id)
    AND (user_id = auth.uid() OR is_company_shared = true)
  );

CREATE POLICY "Users can upload own docs"
  ON user_documents FOR INSERT
  WITH CHECK (is_org_member(org_id) AND user_id = auth.uid());

CREATE POLICY "Users can update own docs"
  ON user_documents FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own docs"
  ON user_documents FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage company docs"
  ON user_documents FOR ALL
  USING (
    is_company_shared = true
    AND EXISTS (
      SELECT 1 FROM memberships
      WHERE org_id = user_documents.org_id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- Document chunks
CREATE POLICY "Org members can view document chunks"
  ON document_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_documents ud
      WHERE ud.id = document_chunks.user_document_id
        AND is_org_member(ud.org_id)
        AND (ud.user_id = auth.uid() OR ud.is_company_shared = true)
    )
  );

-- Scenarios
CREATE POLICY "Org members can manage scenarios"
  ON scenarios FOR ALL
  USING (is_org_member(org_id));

-- Sessions — learners see own; coaches see all in org
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (
    is_org_member(org_id)
    AND (
      user_id = auth.uid()
      OR is_org_coach_or_admin(org_id)
    )
  );

CREATE POLICY "Users can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (is_org_member(org_id) AND user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (user_id = auth.uid() OR is_org_coach_or_admin(org_id));

-- Session turns
CREATE POLICY "Session participants can view turns"
  ON session_turns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_turns.session_id
        AND is_org_member(s.org_id)
        AND (s.user_id = auth.uid() OR is_org_coach_or_admin(s.org_id))
    )
  );

CREATE POLICY "Service can insert turns"
  ON session_turns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_turns.session_id
        AND s.user_id = auth.uid()
    )
  );

-- Evaluations & reports
CREATE POLICY "Users can view own evaluations"
  ON evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = evaluations.session_id
        AND is_org_member(s.org_id)
        AND (s.user_id = auth.uid() OR is_org_coach_or_admin(s.org_id))
    )
  );

CREATE POLICY "Users can view own reports"
  ON feedback_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = feedback_reports.session_id
        AND is_org_member(s.org_id)
        AND (s.user_id = auth.uid() OR is_org_coach_or_admin(s.org_id))
    )
  );

-- Accuracy ratings
CREATE POLICY "Users can rate accuracy"
  ON accuracy_ratings FOR ALL
  USING (user_id = auth.uid());

-- Assignments
CREATE POLICY "Coaches can manage assignments"
  ON assignments FOR ALL
  USING (
    is_org_member(org_id)
    AND (coach_id = auth.uid() OR is_org_coach_or_admin(org_id))
  );

CREATE POLICY "Learners can view own assignments"
  ON assignments FOR SELECT
  USING (learner_id = auth.uid());

CREATE POLICY "Learners can update own assignments"
  ON assignments FOR UPDATE
  USING (learner_id = auth.uid());

-- Coach comments
CREATE POLICY "Coaches can manage comments"
  ON coach_comments FOR ALL
  USING (coach_id = auth.uid() OR is_org_coach_or_admin(
    (SELECT org_id FROM sessions WHERE id = coach_comments.session_id)
  ));

CREATE POLICY "Learners can view coach comments on their sessions"
  ON coach_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = coach_comments.session_id AND s.user_id = auth.uid()
    )
  );

-- Public figure library — readable by all authenticated users
CREATE POLICY "Authenticated users can browse library"
  ON public_figure_library FOR SELECT
  TO authenticated
  USING (moderation_status = 'approved');

-- Usage events
CREATE POLICY "Org members can view usage events"
  ON usage_events FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Users can insert usage events"
  ON usage_events FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_org_member(org_id));
