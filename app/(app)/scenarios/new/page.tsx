import { Suspense } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ScenarioConfigurator } from "@/components/scenarios/ScenarioConfigurator";

export default function NewScenarioPage() {
  return (
    <div>
      <PageHeader title="New scenario" description="Configure your rehearsal" />
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <ScenarioConfigurator />
      </Suspense>
    </div>
  );
}
