"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Library,
  Settings,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthSession } from "@/lib/auth-types";
import { canManageTeam, isTeamMode } from "@/lib/auth-helpers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const baseNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/targets", label: "Targets", icon: Target },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/scenarios", label: "Scenarios", icon: ClipboardList },
  { href: "/library", label: "Library", icon: Library },
  { href: "/progress", label: "Progress", icon: TrendingUp },
];

interface SidebarProps {
  session: AuthSession;
  pendingAssignments?: number;
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({
  session,
  pendingAssignments = 0,
  className,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const team = isTeamMode(session.organization);
  const coach = canManageTeam(session.membership.role);

  const nav = [...baseNav];
  if (team) {
    nav.push({
      href: "/assignments",
      label: "Assignments",
      icon: BookOpen,
    });
  }
  if (team && coach) {
    nav.push({ href: "/admin", label: "Admin", icon: Users });
  }

  const initials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? session.user.email[0]?.toUpperCase() ?? "?";

  return (
    <aside
      className={cn(
        "flex h-full w-sidebar flex-col border-r border-border bg-surface",
        className
      )}
    >
      <div className="border-b border-border-subtle p-4">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="font-display text-h3 text-foreground-primary"
        >
          Rehearsal
        </Link>
        <p className="mt-1 truncate text-caption font-mono uppercase text-foreground-tertiary">
          {session.organization.name}
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          const showBadge =
            href === "/assignments" && pendingAssignments > 0;

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-small transition-colors duration-standard",
                active
                  ? "border-l-[3px] border-accent bg-surface-elevated pl-[9px] text-foreground-primary"
                  : "border-l-[3px] border-transparent text-foreground-secondary hover:bg-surface-elevated hover:text-foreground-primary"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-caption font-mono text-background">
                  {pendingAssignments}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-subtle p-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "mb-2 flex items-center gap-3 rounded-md px-3 py-2 text-small text-foreground-secondary hover:bg-surface-elevated",
            pathname === "/settings" && "text-foreground-primary"
          )}
        >
          <Settings className="h-4 w-4" strokeWidth={1.5} />
          Settings
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-surface-elevated text-small">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-small text-foreground-primary">
              {session.user.name ?? session.user.email}
            </p>
            <p className="truncate text-caption font-mono uppercase text-foreground-tertiary">
              {session.membership.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
