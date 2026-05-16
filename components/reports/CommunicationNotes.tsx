import type { CommunicationNotes as Notes } from "@/types";

export function CommunicationNotes({ notes }: { notes: Notes }) {
  const items = [
    { label: "Filler words", value: notes.filler_words_count },
    { label: "Directness", value: notes.directness },
    { label: "Structure", value: notes.structure },
    { label: "Clarity", value: notes.clarity },
  ];

  return (
    <section>
      <p className="font-mono text-caption uppercase text-foreground-tertiary">
        Delivery
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <p className="text-caption text-foreground-tertiary">{item.label}</p>
            <p className="mt-2 font-display text-h1 text-accent">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
