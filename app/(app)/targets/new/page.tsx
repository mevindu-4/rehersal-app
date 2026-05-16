import { PageHeader } from "@/components/shared/PageHeader";
import { TargetBuilder } from "@/components/targets/TargetBuilder";

export default function NewTargetPage() {
  return (
    <div>
      <PageHeader
        title="Create target"
        description="Build a personality profile from sources"
      />
      <TargetBuilder />
    </div>
  );
}
