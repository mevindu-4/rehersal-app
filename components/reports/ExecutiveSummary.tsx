export function ExecutiveSummary({ text }: { text: string }) {
  return (
    <section className="max-w-[680px]">
      <p className="font-mono text-caption uppercase text-foreground-tertiary">
        Executive summary
      </p>
      <p className="mt-4 font-display text-body-lg italic leading-relaxed text-foreground-primary">
        {text}
      </p>
    </section>
  );
}
