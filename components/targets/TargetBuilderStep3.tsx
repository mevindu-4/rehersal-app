"use client";

import { useEffect } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTarget, useReconstructTarget } from "@/lib/hooks/use-api";
import { cn } from "@/lib/utils";

const STATUS_LINES = [
  { key: "pending", label: "Queued for reconstruction" },
  { key: "reconstructing", label: "Reading sources" },
  { key: "reconstructing", label: "Building personality model" },
  { key: "complete", label: "Profile ready" },
];

export function TargetBuilderStep3({
  targetId,
  onComplete,
}: {
  targetId: string;
  onComplete: () => void;
}) {
  const reconstruct = useReconstructTarget(targetId);
  const { data } = useTarget(targetId, { refetchInterval: 3000 });
  const target = data?.target;
  const status = target?.status ?? "pending";

  useEffect(() => {
    if (!reconstruct.isSuccess && status !== "complete" && status !== "failed") {
      reconstruct.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  useEffect(() => {
    if (status === "complete") onComplete();
  }, [status, onComplete]);

  const progress =
    status === "complete"
      ? 100
      : status === "failed"
        ? 0
        : status === "reconstructing"
          ? 65
          : 20;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-h2 text-foreground-primary">
        Reconstructing profile
      </h2>
      <p className="text-body text-foreground-secondary">
        We analyze your sources to build a rehearsal-ready personality model.
      </p>

      <Progress value={progress} className="h-2" />

      <ul className="space-y-3">
        {STATUS_LINES.map((line, i) => {
          const done =
            status === "complete" ||
            (status === "reconstructing" && i < 3) ||
            (status === "pending" && i === 0);
          const active = status === "reconstructing" && i === 2;
          const failed = status === "failed";

          return (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 text-small",
                done && !failed && "text-foreground-primary",
                !done && !active && "text-foreground-tertiary"
              )}
            >
              {failed && i === STATUS_LINES.length - 1 ? (
                <XCircle className="h-4 w-4 text-critical" strokeWidth={1.5} />
              ) : done ? (
                <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={1.5} />
              ) : active ? (
                <Loader2 className="h-4 w-4 animate-spin text-accent" strokeWidth={1.5} />
              ) : (
                <span className="h-4 w-4 rounded-full border border-border" />
              )}
              <span>
                {line.label}
                {done && status === "complete" && i === STATUS_LINES.length - 1
                  ? " · Done"
                  : ""}
              </span>
            </li>
          );
        })}
      </ul>

      {status === "failed" && (
        <p className="text-small text-critical">
          {target?.error_message ?? "Reconstruction failed. Try adding more sources."}
        </p>
      )}
    </div>
  );
}
