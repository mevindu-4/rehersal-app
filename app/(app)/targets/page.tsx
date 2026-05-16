"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";

type Target = {
  id: string;
  name: string;
  title?: string;
  company?: string;
  reconstruction_status: string;
};

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>([]);

  useEffect(() => {
    fetch("/api/targets")
      .then((r) => r.json())
      .then(setTargets)
      .catch(() => setTargets([]));
  }, []);

  return (
    <div>
      <PageHeader
        title="Targets"
        description="People you are rehearsing against"
        action={
          <Button asChild>
            <Link href="/targets/new">Create target</Link>
          </Button>
        }
      />
      {targets.length === 0 ? (
        <EmptyState
          title="No targets yet"
          description="Build a personality profile from public sources and your notes."
          actionLabel="Create target"
          actionHref="/targets/new"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {targets.map((t) => (
            <Link key={t.id} href={`/targets/${t.id}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">{t.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t.title}
                    {t.company ? ` · ${t.company}` : ""}
                  </p>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Status: {t.reconstruction_status}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
