import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignInForm } from "@/components/auth/SignInForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default async function SignInPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <Suspense fallback={<LoadingSkeleton variant="card" />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
