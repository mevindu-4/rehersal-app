import { redirect } from "next/navigation";
import { CompanyDocumentsClient } from "@/components/documents/CompanyDocumentsClient";
import { requireSession, isTeamMode } from "@/lib/auth";

export default async function CompanyDocumentsPage() {
  const session = await requireSession();

  if (!isTeamMode(session.organization)) {
    redirect("/documents");
  }

  return <CompanyDocumentsClient session={session} />;
}
