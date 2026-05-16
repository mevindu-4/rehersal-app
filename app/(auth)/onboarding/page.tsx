import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { OnboardingFlow } from "@/components/shared/OnboardingFlow";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/signin");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <OnboardingFlow />
    </div>
  );
}
