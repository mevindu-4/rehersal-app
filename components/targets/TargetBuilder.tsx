"use client";

import { useState } from "react";
import { TargetBuilderStep1, type Step1Data } from "./TargetBuilderStep1";
import { TargetBuilderStep2 } from "./TargetBuilderStep2";
import { TargetBuilderStep3 } from "./TargetBuilderStep3";
import { TargetBuilderStep4 } from "./TargetBuilderStep4";
import { Button } from "@/components/ui/button";
import { useCreateTarget } from "@/lib/hooks/use-api";

export function TargetBuilder() {
  const createTarget = useCreateTarget();
  const [step, setStep] = useState(1);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [step1, setStep1] = useState<Step1Data>({
    name: "",
    title: "",
    company: "",
    domain: "interview",
  });

  async function handleStep1Next() {
    const { target } = await createTarget.mutateAsync({
      name: step1.name,
      title: step1.title || undefined,
      company: step1.company || undefined,
      domain: step1.domain,
    });
    setTargetId(target.id);
    setStep(2);
  }

  if (!targetId && step > 1) {
    return <p className="text-critical">Missing target. Go back to step 1.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${s <= step ? "bg-accent" : "bg-border"}`}
          />
        ))}
      </div>

      {step === 1 && (
        <>
          <TargetBuilderStep1 data={step1} onChange={setStep1} />
          <Button
            disabled={!step1.name.trim() || createTarget.isPending}
            onClick={handleStep1Next}
          >
            Continue
          </Button>
        </>
      )}

      {step === 2 && targetId && (
        <>
          <TargetBuilderStep2 targetId={targetId} />
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Start reconstruction</Button>
          </div>
        </>
      )}

      {step === 3 && targetId && (
        <TargetBuilderStep3 targetId={targetId} onComplete={() => setStep(4)} />
      )}

      {step === 4 && targetId && <TargetBuilderStep4 targetId={targetId} />}
    </div>
  );
}
