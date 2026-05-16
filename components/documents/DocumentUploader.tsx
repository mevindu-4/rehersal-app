"use client";

import { useState } from "react";
import { apiErrorMessage, parseApiResponse } from "@/lib/parse-api-response";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DOC_TYPES = [
  { value: "my_background", label: "My background" },
  { value: "opportunity", label: "The opportunity" },
  { value: "company", label: "Company / product" },
  { value: "prior_interactions", label: "Prior interactions" },
  { value: "other", label: "Other" },
] as const;

type Mode = "file" | "paste";

export function DocumentUploader({ onUploaded }: { onUploaded?: () => void }) {
  const [docType, setDocType] = useState<string>("my_background");
  const [mode, setMode] = useState<Mode>("file");
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function uploadFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("doc_type", docType);
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/documents", { method: "POST", body: form });
      const data = await parseApiResponse<{ error?: string; filename?: string }>(
        res
      );
      if (!res.ok) {
        setError(apiErrorMessage(data, "Upload failed"));
        return;
      }
      setSuccess(`Uploaded ${data.filename ?? file.name}`);
      onUploaded?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function uploadPaste() {
    const text = pasteText.trim();
    if (text.length < 20) {
      setError("Please paste at least 20 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_type: docType,
          text,
          filename: "pasted-context.txt",
        }),
      });
      const data = await parseApiResponse<{ error?: string }>(res);
      if (!res.ok) {
        setError(apiErrorMessage(data, "Save failed"));
        return;
      }
      setSuccess("Text saved");
      setPasteText("");
      onUploaded?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card space-y-4 rounded-xl p-6">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "file" ? "default" : "outline"}
          onClick={() => {
            setMode("file");
            setError(null);
          }}
        >
          Upload file
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "paste" ? "default" : "outline"}
          onClick={() => {
            setMode("paste");
            setError(null);
          }}
        >
          Paste text
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Document type</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          disabled={loading}
        >
          {DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {mode === "file" ? (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-4">
          <input
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,text/plain"
            disabled={loading}
            className="w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-cyan-200"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
              e.target.value = "";
            }}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            PDF, DOCX, or TXT. Scanned PDFs without text? Use Paste text instead.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Textarea
            placeholder="Paste resume, deck notes, or conversation context…"
            rows={8}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            disabled={loading}
          />
          <Button type="button" disabled={loading} onClick={uploadPaste}>
            {loading ? "Saving…" : "Save text"}
          </Button>
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse-soft">
          {mode === "file" ? "Uploading and extracting text…" : "Saving…"}
        </p>
      )}
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
          {success}
        </p>
      )}
    </div>
  );
}
