"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonalityProfileCard } from "@/components/targets/PersonalityProfileCard";
import { apiErrorMessage, parseApiResponse } from "@/lib/parse-api-response";
import type { PersonalityProfile } from "@/types";

type Source = { id?: string; url?: string; raw_text?: string; source_type: string };

export function TargetBuilder() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState("interview");
  const [urlInput, setUrlInput] = useState("");
  const [manualText, setManualText] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createTarget() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title, company, domain }),
      });
      const data = await parseApiResponse<{ id: string; error?: string }>(res);
      if (!res.ok) throw new Error(apiErrorMessage(data, "Failed to create target"));
      setTargetId(data.id);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function addUrl() {
    if (!targetId || !urlInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/targets/${targetId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim(), source_type: "article" }),
      });
      const data = await parseApiResponse<Source & { error?: string }>(res);
      if (!res.ok) throw new Error(apiErrorMessage(data, "Failed to add URL"));
      setSources((s) => [...s, data]);
      setUrlInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add URL");
    } finally {
      setLoading(false);
    }
  }

  async function addManual() {
    if (!targetId || !manualText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/targets/${targetId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_type: "manual", raw_text: manualText.trim() }),
      });
      const data = await parseApiResponse<Source & { error?: string }>(res);
      if (!res.ok) throw new Error(apiErrorMessage(data, "Failed to add text"));
      setSources((s) => [...s, data]);
      setManualText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add text");
    } finally {
      setLoading(false);
    }
  }

  async function addFile(file: File) {
    if (!targetId) return;
    const form = new FormData();
    form.append("file", file);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/targets/${targetId}/sources`, {
        method: "POST",
        body: form,
      });
      const data = await parseApiResponse<Source & { error?: string }>(res);
      if (!res.ok) throw new Error(apiErrorMessage(data, "Failed to upload file"));
      setSources((s) => [...s, data]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload file");
    } finally {
      setLoading(false);
    }
  }

  async function runReconstruction() {
    if (!targetId) return;
    setStep(3);
    setStatus("processing");
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/targets/${targetId}/reconstruct`, { method: "POST" });
    const data = await parseApiResponse<{
      personality_json?: PersonalityProfile;
      error?: string;
    }>(res);
    setLoading(false);
    if (!res.ok) {
      setStatus("failed");
      setError(apiErrorMessage(data, "Reconstruction failed"));
      return;
    }
    setProfile(data.personality_json);
    setStatus("complete");
    setStep(4);
  }

  return (
    <div className="max-w-2xl space-y-8">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Step 1 — Basic info</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <select
              id="domain"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              <option value="interview">Interview</option>
              <option value="fundraising">Fundraising</option>
              <option value="sales">Sales</option>
              <option value="negotiation">Negotiation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Button onClick={createTarget} disabled={!name || loading}>
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Step 2 — Sources</h2>
          <div className="flex gap-2">
            <Input
              placeholder="https://..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <Button type="button" onClick={addUrl} disabled={loading}>
              Add URL
            </Button>
          </div>
          <Textarea
            placeholder="Manual description..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={addManual} disabled={loading}>
            Add manual text
          </Button>
          <div>
            <Label>Upload PDF or DOCX</Label>
            <Input
              type="file"
              accept=".pdf,.docx,.txt"
              className="mt-2"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) addFile(f);
              }}
            />
          </div>
          {sources.length > 0 && (
            <ul className="text-sm text-muted-foreground">
              {sources.map((s, i) => (
                <li key={s.id ?? i}>{s.url ?? s.source_type}</li>
              ))}
            </ul>
          )}
          <Button onClick={runReconstruction} disabled={sources.length === 0 || loading}>
            Build profile
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 text-center">
          <h2 className="text-lg font-semibold">Step 3 — Reconstructing</h2>
          <p className="text-muted-foreground">
            {loading ? "Synthesizing personality with Claude…" : `Status: ${status}`}
          </p>
        </div>
      )}

      {step === 4 && profile && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Step 4 — Review profile</h2>
          <PersonalityProfileCard profile={profile} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              Edit sources
            </Button>
            <Button onClick={() => router.push(`/targets/${targetId}`)}>View target</Button>
            <Button onClick={() => router.push("/scenarios/new")}>Create scenario</Button>
          </div>
        </div>
      )}
    </div>
  );
}
