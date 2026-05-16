"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  FileText,
  Clapperboard,
  FileBarChart,
  Library,
  TrendingUp,
  Shield,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/targets", label: "Targets", icon: Target },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/scenarios", label: "Scenarios", icon: Clapperboard },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/library", label: "Library", icon: Library },
  { href: "/progress", label: "Progress", icon: TrendingUp },
];

interface SidebarProps {
  userName?: string | null;
  userEmail?: string | null;
  showAdmin?: boolean;
  authDisabled?: boolean;
}

export function Sidebar({
  userName,
  userEmail,
  showAdmin,
  authDisabled,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="glass-panel flex h-screen w-[17.5rem] shrink-0 flex-col border-r border-white/[0.06]">
      <div className="border-b border-white/[0.06] p-5">
        <Link href="/dashboard" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 ring-1 ring-white/10 transition duration-300 group-hover:shadow-glow-sm">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse-soft" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-gradient">Rehearsal</span>
          </span>
        </Link>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          AI rehearsal studio
        </p>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "nav-active-glow bg-white/[0.06] text-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground hover:translate-x-0.5"
              )}
            >
              <item.icon
                className={cn("h-4 w-4", active && "text-cyan-400")}
              />
              {item.label}
            </Link>
          );
        })}
        {showAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              pathname.startsWith("/admin")
                ? "nav-active-glow bg-white/[0.06] text-foreground"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
            )}
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        )}
      </nav>
      <div className="border-t border-white/[0.06] p-4">
        <p className="truncate text-sm font-medium">{userName ?? "User"}</p>
        <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        <div className="mt-3 flex gap-2">
          <Button asChild variant="ghost" size="sm" className="flex-1">
            <Link href="/settings">
              <Settings className="mr-1 h-3 w-3" />
              Settings
            </Link>
          </Button>
          {!authDisabled && (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
