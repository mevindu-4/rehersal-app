"use client";

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
      <div><Label>Name</Label><Input value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} /></div>
      <div><Label>Title</Label><Input value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} /></div>
      <div><Label>Company</Label><Input value={data.company} onChange={(e) => onChange({ ...data, company: e.target.value })} /></div>
      <div>
        <Label>Domain</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <button key={d} type="button" className={cn("rounded-md border px-3 py-1 text-small capitalize", data.domain === d ? "border-accent bg-highlight-glow" : "border-border")} onClick={() => onChange({ ...data, domain: d })}>{d}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
