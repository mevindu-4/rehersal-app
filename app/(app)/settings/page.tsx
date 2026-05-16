import { requireSession, canManageTeam } from "@/lib/auth";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await requireSession();
  const isTeam = session.organization.mode === "team";
  const isOwner = session.membership.role === "owner";

  return (
    <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-display-2 text-foreground-primary">Settings</h1>
        <p className="mt-2 text-body text-foreground-secondary">
          Workspace, team, and account preferences.
        </p>
      </div>
      <SettingsClient
        session={session}
        isTeam={isTeam}
        isOwner={isOwner}
        canManageTeam={canManageTeam(session.membership.role)}
      />
    </div>
  );
}
