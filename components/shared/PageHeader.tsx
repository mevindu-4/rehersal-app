interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: string;
}

export function PageHeader({
  title,
  description,
  action,
  badge,
}: PageHeaderProps) {
  return (
    <div className="animate-fade-up mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {badge && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
            <span className="mr-2 inline-block h-1 w-1 rounded-full bg-cyan-400 animate-pulse-soft" />
            {badge}
          </p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-base text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
