import { ScenarioConfigurator } from "@/components/scenarios/ScenarioConfigurator";

export default function NewScenarioPage() {
  return (
    <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-display-2 text-foreground-primary">
          New scenario
        </h1>
        <p className="mt-2 text-body text-foreground-secondary">
          Configure a rehearsal — who you speak with, for how long, and what success looks like.
        </p>
      </div>
      <ScenarioConfigurator />
    </div>
  );
}
