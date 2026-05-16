"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SourceDraft {
  source_type: "url" | "document" | "manual";
  url?: string;
  document_id?: string;
  manual_text?: string;
  title?: string;
}

export function SourceManager({
  onAdd,
  pending = [],
}: {
  onAdd: (source: SourceDraft) => void;
  pending?: { title?: string; status: string }[];
}) {
  const [url, setUrl] = useState("");
  const [manual, setManual] = useState("");

  return (
    <Tabs defaultValue="url">
      <TabsList>
        <TabsTrigger value="url">URL</TabsTrigger>
        <TabsTrigger value="document">Document</TabsTrigger>
        <TabsTrigger value="manual">Describe</TabsTrigger>
      </TabsList>
      <TabsContent value="url" className="space-y-3">
        <Input placeholder="https://linkedin.com/in/..." value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button onClick={() => { if (url) { onAdd({ source_type: "url", url }); setUrl(""); } }}>Add URL</Button>
      </TabsContent>
      <TabsContent value="document">
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-small text-foreground-secondary">
          Drop files here or browse (upload via Documents first)
        </div>
      </TabsContent>
      <TabsContent value="manual" className="space-y-3">
        <Textarea rows={6} placeholder="Describe how this person communicates..." value={manual} onChange={(e) => setManual(e.target.value)} />
        <Button onClick={() => { if (manual.trim()) { onAdd({ source_type: "manual", manual_text: manual }); setManual(""); } }}>Add description</Button>
      </TabsContent>
      {pending.length > 0 && (
        <ul className="mt-4 space-y-2">
          {pending.map((s, i) => (
            <li key={i} className="flex items-center gap-2 text-small">
              <span>{s.title ?? "Source"}</span>
              <Badge variant="outline">{s.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Tabs>
  );
}
