import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="animate-scale-in flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center opacity-0 [animation-fill-mode:forwards]">
      <div className="mb-4 h-12 w-12 rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/20 animate-glow-pulse" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild className="mt-6">
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      )}
    </div>
  );
}
