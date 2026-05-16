"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<
    Array<{
      id: string;
      title: string;
      conversation_type: string;
      target_profiles?: { name: string };
    }>
  >([]);

  useEffect(() => {
    fetch("/api/scenarios")
      .then((r) => r.json())
      .then(setScenarios);
  }, []);

  return (
    <div>
      <PageHeader
        title="Scenarios"
        description="Conversation types, duration, and goals"
        action={
          <Button asChild>
            <Link href="/scenarios/new">New scenario</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {scenarios.map((s) => (
          <Link key={s.id} href={`/scenarios/${s.id}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {s.conversation_type.replace(/_/g, " ")}
                  {s.target_profiles?.name ? ` · ${s.target_profiles.name}` : ""}
                </p>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
