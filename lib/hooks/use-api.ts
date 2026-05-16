"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  Assignment,
  Domain,
  FeedbackReport,
  Scenario,
  Session,
  SessionHistoryItem,
  SessionTurn,
  TargetProfile,
  TargetStatus,
  UserDocument,
} from "@/types";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return body as T;
}

export function useTargets(filters?: { status?: TargetStatus; domain?: Domain }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.domain) params.set("domain", filters.domain);
  const qs = params.toString();

  return useQuery({
    queryKey: ["targets", filters],
    queryFn: () =>
      apiFetch<{ targets: TargetProfile[] }>(
        `/api/targets${qs ? `?${qs}` : ""}`
      ),
  });
}

export function useTarget(id: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["targets", id],
    queryFn: () => apiFetch<{ target: TargetProfile }>(`/api/targets/${id}`),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  });
}

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: () =>
      apiFetch<{ documents: UserDocument[] }>("/api/documents"),
  });
}

export function useCompanyDocuments() {
  return useQuery({
    queryKey: ["company-documents"],
    queryFn: () =>
      apiFetch<{ documents: UserDocument[] }>("/api/company-documents"),
  });
}

export function useScenarios() {
  return useQuery({
    queryKey: ["scenarios"],
    queryFn: () =>
      apiFetch<{ scenarios: Scenario[] }>("/api/scenarios"),
  });
}

export function useScenario(id: string) {
  return useQuery({
    queryKey: ["scenarios", id],
    queryFn: () => apiFetch<{ scenario: Scenario }>(`/api/scenarios/${id}`),
    enabled: !!id,
  });
}

export function useSession(id: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["sessions", id],
    queryFn: () =>
      apiFetch<{
        session: Session;
        scenario: Scenario | null;
        target: TargetProfile | null;
        turns: unknown[];
        report_id: string | null;
      }>(`/api/sessions/${id}`),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ["reports", id],
    queryFn: () =>
      apiFetch<{
        report: FeedbackReport;
        evaluation: { overall_score: number; target_fit_score: number } | null;
        coach_comments: unknown[];
        scenario_id: string | null;
        turns: SessionTurn[];
      }>(`/api/reports/${id}`),
    enabled: !!id,
  });
}

export function useLibrary(filters?: { category?: string; domain?: string }) {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.domain) params.set("domain", filters.domain);
  const qs = params.toString();

  return useQuery({
    queryKey: ["library", filters],
    queryFn: () => apiFetch<{ profiles: unknown[] }>(`/api/library${qs ? `?${qs}` : ""}`),
  });
}

export function useLibraryProfile(id: string) {
  return useQuery({
    queryKey: ["library", id],
    queryFn: () => apiFetch<{ profile: unknown }>(`/api/library/${id}`),
    enabled: !!id,
  });
}

export function useAssignments() {
  return useQuery({
    queryKey: ["assignments"],
    queryFn: () =>
      apiFetch<{ assignments: Assignment[] }>("/api/assignments"),
  });
}

export function useSessions(options?: { limit?: number; status?: string }) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.status) params.set("status", options.status);
  const qs = params.toString();

  return useQuery({
    queryKey: ["sessions", options],
    queryFn: () =>
      apiFetch<{ sessions: import("@/types").SessionHistoryItem[] }>(
        `/api/sessions${qs ? `?${qs}` : ""}`
      ),
  });
}

export function useCreateTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      title?: string;
      company?: string;
      domain: Domain;
      tags?: string[];
    }) =>
      apiFetch<{ target: TargetProfile }>("/api/targets", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["targets"] }),
  });
}

export function useCloneLibraryProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ target: TargetProfile }>(`/api/library/${id}/clone`, {
        method: "POST",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["targets"] });
      qc.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

export function useUpdateTarget(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<{ target: TargetProfile }>(`/api/targets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["targets"] });
      qc.invalidateQueries({ queryKey: ["targets", id] });
    },
  });
}

export function useAddSource(targetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      source_type: "url" | "document" | "manual";
      url?: string;
      document_id?: string;
      manual_text?: string;
      title?: string;
    }) =>
      apiFetch<{ source: unknown }>(`/api/targets/${targetId}/sources`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["targets", targetId] }),
  });
}

export function useReconstructTarget(targetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ message: string }>(`/api/targets/${targetId}/reconstruct`, {
        method: "POST",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["targets", targetId] }),
  });
}

export function useCreateScenario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      conversation_type: Scenario["conversation_type"];
      target_profile_id: string;
      duration_minutes: number;
      difficulty: Scenario["difficulty"];
      goal: string;
      included_document_ids?: string[];
    }) =>
      apiFetch<{ scenario: Scenario }>("/api/scenarios", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scenarios"] }),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { scenario_id: string; assignment_id?: string }) =>
      apiFetch<{ session: Session; join_url: string }>("/api/sessions", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useRateAccuracy(reportId: string) {
  return useMutation({
    mutationFn: (body: { accuracy_score: number; feedback_text?: string }) =>
      apiFetch(`/api/reports/${reportId}/rate-accuracy`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      learner_ids: string[];
      scenario_id: string;
      due_date?: string;
      message?: string;
    }) =>
      apiFetch<{ assignments: Assignment[] }>("/api/assignments", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

export type TeamMemberRow = {
  membership_id: string;
  role: string;
  joined_at: string;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    avatar_url: string | null;
  };
};

export function useTeamMembers(enabled = true) {
  return useQuery({
    queryKey: ["team", "members"],
    queryFn: () =>
      apiFetch<{ members: TeamMemberRow[] }>("/api/team/members"),
    enabled,
  });
}

export function useAdminSessions(enabled = true) {
  return useQuery({
    queryKey: ["admin", "sessions"],
    queryFn: () =>
      apiFetch<{ sessions: SessionHistoryItem[] }>("/api/admin/sessions"),
    enabled,
  });
}
