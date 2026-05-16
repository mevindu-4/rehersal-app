import { PageHeader } from "@/components/shared/PageHeader";

export default function ReconstructPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <PageHeader
        title="Building profile"
        description={`Reconstructing target ${params.id}`}
      />
      <p className="text-sm text-muted-foreground">
        Reconstruction progress UI — Phase 2.
      </p>
    </div>
  );
}
