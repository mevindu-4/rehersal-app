import { TargetBuilder } from "@/components/targets/TargetBuilder";

export default function NewTargetPage() {
  return (
    <div className="mx-auto max-w-app p-8">
      <h1 className="mb-8 font-display text-display-2 text-foreground-primary">
        New target
      </h1>
      <TargetBuilder />
    </div>
  );
}
