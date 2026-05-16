"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CoachComment } from "@/types";

export function CoachCommentBox({
  reportId,
  sessionId,
  turnSequence,
  existing,
}: {
  reportId: string;
  sessionId: string;
  turnSequence?: number;
  existing?: CoachComment[];
}) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<CoachComment[]>(existing ?? []);

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/coach-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: reportId,
          session_id: sessionId,
          turn_sequence: turnSequence,
          comment_text: text.trim(),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setComments((c) => [...c, body.comment]);
      setText("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-md border border-accent/30 bg-highlight-glow p-4">
      <p className="font-mono text-caption uppercase text-accent">Coach note</p>
      {comments.map((c) => (
        <p key={c.id} className="mt-2 text-small text-foreground-secondary">
          {c.comment_text}
        </p>
      ))}
      <Textarea
        className="mt-3"
        rows={2}
        placeholder="Add coaching feedback…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        size="sm"
        className="mt-2"
        disabled={saving || !text.trim()}
        onClick={() => void submit()}
      >
        {saving ? "Saving…" : "Add comment"}
      </Button>
    </div>
  );
}
