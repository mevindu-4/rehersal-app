"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConversationTypePicker } from "@/components/scenarios/ConversationTypePicker";
import { DifficultySlider } from "@/components/scenarios/DifficultySlider";
import { AvatarBriefPreview } from "@/components/scenarios/AvatarBriefPreview";
import {
  useCreateScenario,
  useDocuments,
  useTargets,
} from "@/lib/hooks/use-api";
import { DOC_TYPE_LABELS } from "@/lib/constants";
import type { ConversationType, Difficulty } from "@/types";

export function ScenarioConfigurator() {
  const router = useRouter();
  const createScenario = useCreateScenario();
  const { data: targetsData } = useTargets({ status: "complete" });
  const { data: docsData } = useDocuments();

  const [title, setTitle] = useState("");
  const [conversationType, setConversationType] =
    useState<ConversationType>("job_interview");
  const [targetId, setTargetId] = useState("");
  const [duration, setDuration] = useState(15);
  const [difficulty, setDifficulty] = useState<Difficulty>(3);
  const [goal, setGoal] = useState("");
  const [docIds, setDocIds] = useState<string[]>([]);

  const targets = targetsData?.targets ?? [];
  const documents = (docsData?.documents ?? []).filter(
    (d) => d.embedding_status === "complete"
  );

  const docNames = useMemo(
    () =>
      documents
        .filter((d) => docIds.includes(d.id))
        .map((d) => d.filename)
        .join(", "),
    [documents, docIds]
  );

  function toggleDoc(id: string) {
    setDocIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { scenario } = await createScenario.mutateAsync({
      title,
      conversation_type: conversationType,
      target_profile_id: targetId,
      duration_minutes: duration,
      difficulty,
      goal,
      included_document_ids: docIds,
    });
    router.push(`/scenarios/${scenario.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-10">
      <section className="space-y-4">
        <Label>Conversation type</Label>
        <ConversationTypePicker
          value={conversationType}
          onChange={setConversationType}
        />
      </section>

      <section className="space-y-4">
        <Label htmlFor="title">Scenario title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Series A partner pitch"
          required
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Target</Label>
          <Link href="/library" className="text-small text-accent hover:underline">
            Browse library
          </Link>
        </div>
        <Select value={targetId} onValueChange={setTargetId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a target" />
          </SelectTrigger>
          <SelectContent>
            {targets.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
                {t.company ? ` · ${t.company}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="space-y-4">
        <Label>Duration — {duration} minutes</Label>
        <Slider
          min={5}
          max={30}
          step={5}
          value={[duration]}
          onValueChange={([v]) => setDuration(v)}
        />
        <p className="font-display text-h1 text-accent">{duration}</p>
      </section>

      <section className="space-y-4">
        <Label>Difficulty</Label>
        <DifficultySlider value={difficulty} onChange={setDifficulty} />
      </section>

      <section className="space-y-4">
        <Label htmlFor="goal">Session goal</Label>
        <Textarea
          id="goal"
          rows={5}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What do you want to practice or achieve?"
          required
        />
      </section>

      <section className="space-y-4">
        <Label>Context documents</Label>
        {documents.length === 0 ? (
          <p className="text-small text-foreground-secondary">
            No ready documents.{" "}
            <Link href="/documents" className="text-accent hover:underline">
              Upload context
            </Link>
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <label
                key={doc.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3"
              >
                <Checkbox
                  checked={docIds.includes(doc.id)}
                  onCheckedChange={() => toggleDoc(doc.id)}
                />
                <span className="text-small">
                  {doc.filename}{" "}
                  <span className="text-foreground-tertiary">
                    ({DOC_TYPE_LABELS[doc.doc_type]})
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
        {docNames && (
          <p className="text-small text-foreground-secondary">
            The avatar will know about: {docNames}
          </p>
        )}
      </section>

      <AvatarBriefPreview targetId={targetId || null} />

      <Button
        type="submit"
        disabled={
          createScenario.isPending || !title || !targetId || !goal.trim()
        }
      >
        {createScenario.isPending ? "Creating…" : "Create scenario"}
      </Button>
    </form>
  );
}
