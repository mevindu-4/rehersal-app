"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useTeamMembers } from "@/lib/hooks/use-api";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { toast } from "@/hooks/use-toast";
import type { Role } from "@/types";

export function SettingsClient({
  session,
  isTeam,
  isOwner,
  canManageTeam,
}: {
  session: {
    user: { email: string; name: string | null };
    organization: { name: string; mode: string };
    membership: { role: Role };
  };
  isTeam: boolean;
  isOwner: boolean;
  canManageTeam: boolean;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState(session.organization.name);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("learner");
  const [inviting, setInviting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const { data: teamData, isLoading: teamLoading } = useTeamMembers(isTeam && canManageTeam);

  async function saveWorkspace() {
    const trimmed = workspaceName.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_name: trimmed }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to save");
      toast({ title: "Workspace updated" });
      router.refresh();
    } catch (e) {
      toast({
        title: "Could not save",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function exportData() {
    setExporting(true);
    try {
      const res = await fetch("/api/settings/export");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rehearsal-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export downloaded" });
    } catch (e) {
      toast({
        title: "Export failed",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }

  async function sendInvite() {
    const trimmed = inviteEmail.trim();
    if (!trimmed) return;
    setInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, role: inviteRole }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Invite failed");
      setInviteEmail("");
      toast({
        title: "Invite queued",
        description: body.message ?? `Invite recorded for ${trimmed}`,
      });
    } catch (e) {
      toast({
        title: "Could not invite",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  }

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  }

  async function deleteWorkspace() {
    setDeleting(true);
    try {
      const res = await fetch("/api/settings", { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Delete failed");
      setDeleteOpen(false);
      toast({ title: "Workspace deleted" });
      router.push(body.redirect ?? "/onboarding");
      router.refresh();
    } catch (e) {
      toast({
        title: "Could not delete workspace",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Tabs defaultValue="general" className="max-w-xl">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        {isTeam && <TabsTrigger value="team">Team</TabsTrigger>}
        <TabsTrigger value="data">Data</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6 space-y-4">
        <div>
          <Label htmlFor="workspace">Workspace name</Label>
          <Input
            id="workspace"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="mt-2"
            disabled={!isOwner}
          />
        </div>
        <p className="text-small text-foreground-tertiary">
          Mode: {session.organization.mode} · Role: {session.membership.role}
        </p>
        {isOwner ? (
          <Button
            disabled={saving || !workspaceName.trim()}
            onClick={() => void saveWorkspace()}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        ) : (
          <p className="text-small text-foreground-secondary">
            Only workspace owners can rename the workspace.
          </p>
        )}
      </TabsContent>

      {isTeam && (
        <TabsContent value="team" className="mt-6 space-y-6">
          {canManageTeam && (
            <div className="space-y-3">
              <Label>Invite teammate</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  placeholder="email@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Select
                  value={inviteRole}
                  onValueChange={(v) => setInviteRole(v as Role)}
                >
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learner">Learner</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  disabled={inviting || !inviteEmail.trim()}
                  onClick={() => void sendInvite()}
                >
                  {inviting ? "Sending…" : "Invite"}
                </Button>
              </div>
            </div>
          )}

          {session.membership.role === "owner" && (
            <div className="rounded-lg border border-border p-4">
              <p className="text-body text-foreground-secondary">
                Manage shared company context for your team.
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href="/company-documents">Company documents</Link>
              </Button>
            </div>
          )}

          <div className="space-y-3">
            <Label>Members</Label>
            {teamLoading ? (
              <LoadingSkeleton rows={3} />
            ) : (teamData?.members ?? []).length === 0 ? (
              <p className="text-small text-foreground-secondary">No members yet.</p>
            ) : (
              <ul className="divide-y divide-border-subtle rounded-lg border border-border">
                {(teamData?.members ?? []).map((m) => (
                  <li
                    key={m.membership_id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-body text-foreground-primary">
                        {m.user.name ?? m.user.email ?? "Member"}
                      </p>
                      <p className="text-small text-foreground-tertiary">
                        {m.user.email}
                      </p>
                    </div>
                    <span className="font-mono text-caption uppercase text-foreground-tertiary">
                      {m.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      )}

      <TabsContent value="data" className="mt-6 space-y-4">
        <p className="text-body text-foreground-secondary">
          Download a JSON export of your workspace data.
        </p>
        <Button
          variant="outline"
          disabled={!isOwner || exporting}
          onClick={() => void exportData()}
        >
          {exporting ? "Exporting…" : "Export all data"}
        </Button>
        {!isOwner && (
          <p className="text-small text-foreground-tertiary">
            Export is available to workspace owners only.
          </p>
        )}
        <div className="rounded-lg border border-critical/40 p-4">
          <p className="font-display text-h3 text-critical">Danger zone</p>
          <p className="mt-2 text-small text-foreground-secondary">
            Permanently delete this workspace and all associated data.
          </p>
          <Button
            variant="outline"
            className="mt-4 border-critical text-critical hover:bg-critical/10"
            disabled={!isOwner}
            onClick={() => setDeleteOpen(true)}
          >
            Delete workspace
          </Button>
          {!isOwner && (
            <p className="mt-2 text-small text-foreground-tertiary">
              Only owners can delete a workspace.
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="account" className="mt-6 space-y-4">
        <div>
          <Label>Email</Label>
          <p className="mt-1 text-body">{session.user.email}</p>
        </div>
        <div>
          <Label>Name</Label>
          <p className="mt-1 text-body">{session.user.name ?? "—"}</p>
        </div>
        <Button variant="outline" onClick={() => void signOut()}>
          <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Sign out
        </Button>
      </TabsContent>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteConfirm("");
        }}
        title="Delete workspace?"
        description="All targets, sessions, and reports will be permanently removed."
        confirmLabel={deleting ? "Deleting…" : "Delete workspace"}
        destructive
        loading={deleting}
        confirmDisabled={deleteConfirm !== session.organization.name}
        onConfirm={() => void deleteWorkspace()}
      >
        <div className="py-2">
          <Label htmlFor="delete-confirm">
            Type <strong>{session.organization.name}</strong> to confirm
          </Label>
          <Input
            id="delete-confirm"
            className="mt-2"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={session.organization.name}
          />
        </div>
      </ConfirmDialog>
    </Tabs>
  );
}
