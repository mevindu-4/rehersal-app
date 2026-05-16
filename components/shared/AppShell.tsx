"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import type { AuthSession } from "@/lib/auth-types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  session: AuthSession;
  pendingAssignments?: number;
  children: React.ReactNode;
}

export function AppShell({
  session,
  pendingAssignments,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        session={session}
        pendingAssignments={pendingAssignments}
        className="hidden md:flex"
      />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-sidebar p-0">
          <Sidebar
            session={session}
            pendingAssignments={pendingAssignments}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center border-b border-border bg-surface px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </Button>
          <span className="ml-3 font-display text-h3">Rehearsal</span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
