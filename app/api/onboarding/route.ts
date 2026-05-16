import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { OnboardingSchema } from "@/lib/schemas";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const parsed = await parseJsonBody(request, OnboardingSchema);
  if ("error" in parsed) return parsed.error;

  const { intent, workspace_name, primary_use_case, starter_target_id, invite_emails } =
    parsed.data;

  const supabase = createServiceSupabaseClient();
  const orgId = auth.session.organization.id;

  const slug =
    slugify(workspace_name).slice(0, 40) + "-" + orgId.slice(0, 8);

  const { error: orgError } = await supabase
    .from("organizations")
    .update({
      name: workspace_name,
      mode: intent,
      slug,
    })
    .eq("id", orgId);

  if (orgError) return jsonError(orgError.message, 500);

  await supabase.from("audit_logs").insert({
    org_id: orgId,
    user_id: auth.session.user.id,
    action: "onboarding_complete",
    resource_type: "organization",
    resource_id: orgId,
    metadata: { primary_use_case, intent },
  });

  let clonedTargetId: string | null = null;

  if (starter_target_id) {
    const { data: profile } = await supabase
      .from("public_figure_library")
      .select("*")
      .eq("id", starter_target_id)
      .eq("moderation_status", "approved")
      .maybeSingle();

    if (profile) {
      const { data: target } = await supabase
        .from("target_profiles")
        .insert({
          org_id: orgId,
          created_by: auth.session.user.id,
          name: profile.name,
          title: profile.title,
          company: profile.company,
          domain: profile.domain,
          tags: profile.tags ?? [],
          personality_json: profile.profile_json,
          avatar_brief_template: profile.avatar_brief_template,
          is_library: true,
          is_public_figure: profile.category === "real_figure",
          status: "complete",
        })
        .select("id")
        .single();

      if (target) {
        clonedTargetId = target.id;
        await supabase
          .from("public_figure_library")
          .update({ usage_count: (profile.usage_count ?? 0) + 1 })
          .eq("id", starter_target_id);
      }
    }
  }

  if (invite_emails?.length && intent === "team") {
    for (const invite of invite_emails) {
      await supabase.from("audit_logs").insert({
        org_id: orgId,
        user_id: auth.session.user.id,
        action: "invite_queued",
        resource_type: "membership",
        metadata: { email: invite.email, role: invite.role },
      });
    }
  }

  return jsonOk({
    organization: {
      id: orgId,
      name: workspace_name,
      mode: intent,
    },
    cloned_target_id: clonedTargetId,
    invites_queued: invite_emails?.length ?? 0,
  });
}
