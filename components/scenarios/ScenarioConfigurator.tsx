"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CONVERSATION_TYPES = [
  { value: "job_interview", label: "Job interview" },
  { value: "fundraising", label: "Fundraising pitch" },
  { value: "sales_discovery", label: "Sales discovery" },
  { value: "difficult_conversation", label: "Difficult conversation" },
  { value: "negotiation", label: "Negotiation" },
  { value: "deposition", label: "Deposition prep" },
  { value: "media_interview", label: "Media / podcast" },
  { value: "board_meeting", label: "Board meeting" },
  { value: "custom", label: "Custom" },
];

export function ScenarioConfigurator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTarget = searchParams.get("targetId") ?? "";

  const [targets, setTargets] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [conversationType, setConversationType] = useState("job_interview");
  const [duration, setDuration] = useState(15);
  const [difficulty, setDifficulty] = useState(3);
  const [goal, setGoal] = useState("");
  const [targetId, setTargetId] = useState(preselectedTarget);
  const [briefPreview, setBriefPreview] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/targets")
      .then((r) => r.json())
      .then((list) =>
        setTargets(
          list
            .filter((t: { reconstruction_status: string }) => t.reconstruction_status === "complete")
            .map((t: { id: string; name: string }) => ({ id: t.id, name: t.name }))
        )
      );
  }, []);

  async function saveScenario() {
    const res = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        conversation_type: conversationType,
        duration_minutes: duration,
        difficulty,
        goal,
        target_profile_id: targetId || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setScenarioId(data.id);
      return data.id as string;
    }
    alert(data.error);
    return null;
  }

  async function previewBrief() {
    const sid = scenarioId ?? (await saveScenario());
    if (!targetId || !sid) return;
    const res = await fetch(
      `/api/targets/${targetId}/preview?scenarioId=${sid}`
    );
    const data = await res.json();
    if (res.ok) setBriefPreview(data.plainEnglishPreview);
    else alert(data.error);
  }

  async function startSession() {
    const sid = scenarioId ?? (await saveScenario());
    if (!sid || !targetId) return;
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: sid, targetProfileId: targetId }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/sessions/${data.sessionId}`);
    else alert(data.error);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Target</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
        >
          <option value="">Select target</option>
          {targets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Conversation type</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={conversationType}
          onChange={(e) => setConversationType(e.target.value)}
        >
          {CONVERSATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Duration (minutes): {duration}</Label>
        <input
          type="range"
          min={5}
          max={30}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label>Pressure: {difficulty}/5</Label>
        <input
          type="range"
          min={1}
          max={5}
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label>Session goal</Label>
        <Textarea value={goal} onChange={(e) => setGoal(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={previewBrief}>
          Preview avatar brief
        </Button>
        <Button type="button" onClick={startSession} disabled={!targetId || !title}>
          Start session
        </Button>
      </div>
      {briefPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avatar brief preview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
            {briefPreview}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
