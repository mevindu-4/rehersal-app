-- Migration 004: Performance Indexes

CREATE INDEX sessions_user_id_idx ON sessions (user_id);
CREATE INDEX sessions_org_id_idx ON sessions (org_id);
CREATE INDEX sessions_status_idx ON sessions (status);
CREATE INDEX sessions_created_at_idx ON sessions (created_at DESC);

CREATE INDEX target_profiles_org_id_idx ON target_profiles (org_id);
CREATE INDEX target_profiles_status_idx ON target_profiles (status);
CREATE INDEX target_profiles_created_by_idx ON target_profiles (created_by);

CREATE INDEX scenarios_org_id_idx ON scenarios (org_id);
CREATE INDEX scenarios_target_profile_id_idx ON scenarios (target_profile_id);

CREATE INDEX user_documents_org_id_idx ON user_documents (org_id);
CREATE INDEX user_documents_user_id_idx ON user_documents (user_id);
CREATE INDEX user_documents_embedding_status_idx ON user_documents (embedding_status);

CREATE INDEX assignments_learner_id_idx ON assignments (learner_id);
CREATE INDEX assignments_status_idx ON assignments (status);
CREATE INDEX assignments_org_id_idx ON assignments (org_id);
CREATE INDEX assignments_coach_id_idx ON assignments (coach_id);

CREATE INDEX memberships_user_id_idx ON memberships (user_id);
CREATE INDEX memberships_org_id_idx ON memberships (org_id);

CREATE INDEX feedback_reports_session_id_idx ON feedback_reports (session_id);
CREATE INDEX evaluations_session_id_idx ON evaluations (session_id);

CREATE INDEX public_figure_library_category_idx ON public_figure_library (category);
CREATE INDEX public_figure_library_domain_idx ON public_figure_library (domain);
CREATE INDEX public_figure_library_featured_idx ON public_figure_library (is_featured) WHERE is_featured = true;

CREATE INDEX usage_events_org_id_created_idx ON usage_events (org_id, created_at DESC);
