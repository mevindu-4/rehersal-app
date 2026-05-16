import { PageHeader } from "@/components/shared/PageHeader";

export default function ScenarioDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <PageHeader title="Scenario" description={`ID: ${params.id}`} />
    </div>
  );
}
