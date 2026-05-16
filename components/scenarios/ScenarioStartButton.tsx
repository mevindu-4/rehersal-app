"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCreateSession } from "@/lib/hooks/use-api";

export function ScenarioStartButton({ scenarioId }: { scenarioId: string }) {
  const router = useRouter();
  const createSession = useCreateSession();

  async function handleStart() {
    const { session } = await createSession.mutateAsync({ scenario_id: scenarioId });
    router.push(`/sessions/${session.id}`);
  }

  return (
    <Button onClick={handleStart} disabled={createSession.isPending}>
      Start rehearsal
    </Button>
  );
}
