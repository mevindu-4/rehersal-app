"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PersonalityJSON } from "@/types";

interface PersonalityProfileCardProps {
  personality: PersonalityJSON;
  editable?: boolean;
  onSave?: (personality: PersonalityJSON) => void;
}

function Section({
  title,
  border = "accent",
  children,
}: {
  title: string;
  border?: "accent" | "terracotta" | "sage";
  children: React.ReactNode;
}) {
  const borderClass =
    border === "terracotta"
      ? "border-l-critical"
      : border === "sage"
        ? "border-l-success"
        : "border-l-accent";
  return (
    <Card className={cn("border border-border p-4", borderClass, "border-l-[3px]")}>
      <h3 className="text-caption font-mono uppercase text-foreground-tertiary">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

export function PersonalityProfileCard({
  personality,
  editable,
  onSave,
}: PersonalityProfileCardProps) {
  const [draft, setDraft] = useState(personality);
  const p = editable ? draft : personality;

  return (
    <div className="space-y-4">
      <Section title="Communication style">
        <div className="flex flex-wrap gap-2">
          {Object.entries(p.communication_style).map(([k, v]) => (
            <span
              key={k}
              className="rounded-md bg-surface-elevated px-3 py-1 text-small capitalize"
            >
              {k}: {v}
            </span>
          ))}
        </div>
      </Section>

      <Section title="What they value">
        <ul className="list-inside list-disc space-y-1 text-body">
          {p.core_values.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </Section>

      <Section title="Typical questions">
        {p.typical_question_patterns.map((q) => (
          <p key={q} className="font-display italic text-body-lg text-foreground-primary">
            &ldquo;{q}&rdquo;
          </p>
        ))}
      </Section>

      <Section title="Known skepticisms" border="terracotta">
        <ul className="space-y-2">
          {p.known_skepticisms.map((s) => (
            <li key={s} className="border-l-[3px] border-l-critical pl-3 text-body">
              {s}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="What impresses them" border="sage">
        <ul className="space-y-2">
          {p.what_impresses_them.map((s) => (
            <li key={s} className="border-l-[3px] border-l-success pl-3 text-body">
              {s}
            </li>
          ))}
        </ul>
      </Section>

      {editable && onSave && (
        <Button onClick={() => onSave(draft)}>Save profile</Button>
      )}
    </div>
  );
}
