export function SuggestedAnswer({
  original,
  suggested,
  rationale,
}: {
  original: string;
  suggested: string;
  rationale: string;
}) {
  return (
    <div className="space-y-3 rounded-md bg-surface-elevated p-4">
      <div>
        <p className="text-caption font-mono uppercase text-foreground-tertiary">
          You said
        </p>
        <p className="mt-1 text-small text-foreground-secondary">{original}</p>
      </div>
      <div>
        <p className="text-caption font-mono uppercase text-accent">Try instead</p>
        <p className="mt-1 font-display italic text-foreground-primary">
          {suggested}
        </p>
      </div>
      <p className="text-small text-foreground-tertiary">{rationale}</p>
    </div>
  );
}
