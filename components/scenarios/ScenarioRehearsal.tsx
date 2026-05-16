"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PreSessionChecklist } from "@/components/sessions/PreSessionChecklist";
import { useDocuments, useTarget } from "@/lib/hooks/use-api";
import type { Scenario } from "@/types";

export function ScenarioRehearsal({ scenario }: { scenario: Scenario }) {
  const [showChecklist, setShowChecklist] = useState(false);
  const { data: targetData } = useTarget(scenario.target_profile_id);
  const { data: docsData } = useDocuments();
  const target = targetData?.target;

  if (showChecklist && target) {
    return (
      <PreSessionChecklist
        scenario={scenario}
        target={target}
        documents={docsData?.documents ?? []}
        onSessionReady={() => setShowChecklist(false)}
      />
    );
  }

  return (
    <Button onClick={() => setShowChecklist(true)} disabled={!target}>
      Start rehearsal
    </Button>
  );
}
