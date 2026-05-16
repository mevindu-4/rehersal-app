import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "components");

const files = {
  "targets/SourceManager.tsx": `"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SourceDraft {
  source_type: "url" | "document" | "manual";
  url?: string;
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
        <motion className="rounded-lg border border-dashed border-border p-8 text-center text-small text-foreground-secondary">
          Drop files here or browse (upload via Documents first)
        </motion>
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
`,

  "targets/TargetBuilderStep1.tsx": `"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Domain } from "@/types";

const DOMAINS: Domain[] = ["interview", "fundraising", "sales", "negotiation", "personal", "other"];

export interface Step1Data {
  name: string;
  title: string;
  company: string;
  domain: Domain;
}

export function TargetBuilderStep1({ data, onChange }: { data: Step1Data; onChange: (d: Step1Data) => void }) {
  return (
    <div className="space-y-4">
      <motion><Label>Name</Label><Input value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} /></motion>
      <motion><Label>Title</Label><Input value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} /></motion>
      <motion><Label>Company</Label><Input value={data.company} onChange={(e) => onChange({ ...data, company: e.target.value })} /></motion>
      <motion>
        <Label>Domain</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <button key={d} type="button" className={cn("rounded-md border px-3 py-1 text-small capitalize", data.domain === d ? "border-accent bg-highlight-glow" : "border-border")} onClick={() => onChange({ ...data, domain: d })}>{d}</button>
          ))}
        </motion>
      </motion>
    </motion>
  );
}
`,
};

// Fix motion -> div in all generated content
for (const [rel, content] of Object.entries(files)) {
  const fixed = content.replaceAll("<motion", "<div").replaceAll("</motion>", "</div>");
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, fixed);
}

console.log("Wrote", Object.keys(files).length, "files");
