"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Figure = {
  id: string;
  name: string;
  title: string;
  domain: string;
  type: string;
};

export default function InAppLibraryPage() {
  const router = useRouter();
  const [figures, setFigures] = useState<Figure[]>([]);

  useEffect(() => {
    fetch("/api/library")
      .then((r) => r.json())
      .then(setFigures);
  }, []);

  async function clone(id: string) {
    const res = await fetch(`/api/library/${id}/clone`, { method: "POST" });
    const data = await res.json();
    if (res.ok) router.push(`/targets/${data.id}`);
    else alert(data.error);
  }

  return (
    <div>
      <PageHeader
        title="Public figure library"
        description="Clone archetypes into your workspace"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {figures.map((f) => (
          <Card key={f.id}>
            <CardHeader>
              <p className="text-xs uppercase text-primary">{f.type}</p>
              <CardTitle className="text-lg">{f.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {f.title} · {f.domain}
              </p>
              <Button size="sm" onClick={() => clone(f.id)}>
                Clone to workspace
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
