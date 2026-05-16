import { SessionPageClient } from "@/components/sessions/SessionPageClient";

export default function SessionPage({
  params,
}: {
  params: { id: string };
}) {
  return <SessionPageClient sessionId={params.id} />;
}
