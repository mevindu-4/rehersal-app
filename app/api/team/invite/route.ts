import { requireAuth, requireCoach } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { sendTeamInviteEmail } from "@/lib/email";
import { createServiceSupabaseClient } from "@/lib/db";
import { TeamInviteSchema } from "@/lib/schemas";

/** Queue a team invite (audit log). Email delivery requires Resend — not yet wired. */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireCoach(auth.session);
  if (forbidden) return forbidden;

  if (auth.session.organization.mode !== "team") {
    return jsonError("Invites require team mode", 400);
  }

  const parsed = await parseJsonBody(request, TeamInviteSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("audit_logs").insert({
    org_id: auth.session.organization.id,
    user_id: auth.session.user.id,
    action: "invite_queued",
    resource_type: "membership",
    metadata: {
      email: parsed.data.email,
      role: parsed.data.role,
    },
  });

  if (error) return jsonError(error.message, 500);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const emailResult = await sendTeamInviteEmail({
    to: parsed.data.email,
    inviterName: auth.session.user.name ?? auth.session.user.email,
    orgName: auth.session.organization.name,
    role: parsed.data.role,
    appUrl,
  });

  return jsonOk({
    queued: true,
    email: parsed.data.email,
    email_sent: emailResult.sent,
    message: emailResult.sent
      ? `Invite email sent to ${parsed.data.email}`
      : emailResult.reason ??
        "Invite recorded. Configure RESEND_API_KEY to send emails.",
  });
}
