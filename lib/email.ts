type InviteEmailParams = {
  to: string;
  inviterName: string;
  orgName: string;
  role: string;
  appUrl: string;
};

export async function sendTeamInviteEmail(
  params: InviteEmailParams
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? "Rehearsal <onboarding@resend.dev>";
  const signInUrl = `${params.appUrl.replace(/\/$/, "")}/signin`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: `You're invited to ${params.orgName} on Rehearsal`,
      html: `
        <p>${params.inviterName} invited you to join <strong>${params.orgName}</strong> on Rehearsal as a <strong>${params.role}</strong>.</p>
        <p>Rehearsal helps you practice high-stakes conversations with AI avatars before the real thing.</p>
        <p><a href="${signInUrl}">Sign in to accept</a></p>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { sent: false, reason: body || `Resend error ${res.status}` };
  }

  return { sent: true };
}
