"use client";

import { useQuery } from "@tanstack/react-query";
import { SourceManager, type SourceDraft } from "./SourceManager";
import { useAddSource, useDocuments } from "@/lib/hooks/use-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { TargetSource } from "@/types";

async function fetchSources(targetId: string) {
  const res = await fetch(`/api/targets/${targetId}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Failed to load sources");
  return body as { sources: TargetSource[] };
}

export function TargetBuilderStep2({ targetId }: { targetId: string }) {
  const addSource = useAddSource(targetId);
  const { data: docs } = useDocuments();
  const { data, refetch } = useQuery({
    queryKey: ["targets", targetId, "sources"],
    queryFn: () => fetchSources(targetId),
    enabled: !!targetId,
  });

  const sources = data?.sources ?? [];
  const documents = docs?.documents ?? [];

  async function handleAdd(draft: SourceDraft) {
    await addSource.mutateAsync(draft);
    refetch();
  }

  return (
    <div className="space-y-6">
      <SourceManager
        onAdd={handleAdd}
        pending={sources.map((s) => ({
          title: s.title ?? s.url ?? "Manual note",
          status: s.status,
        }))}
      />

      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-small text-foreground-secondary">
            Link an uploaded document as a source
          </p>
          <Select
            onValueChange={(docId) =>
              handleAdd({ source_type: "document", document_id: docId })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select document" />
            </SelectTrigger>
            <SelectContent>
              {documents.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.filename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <ul className="space-y-2">
        {sources.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-md border border-border p-3 text-small"
          >
            <span className="truncate">
              {s.title ?? s.url ?? "Manual description"}
            </span>
            <Badge variant="outline">{s.status}</Badge>
          </li>
        ))}
      </ul>

      {addSource.isError && (
        <p className="text-small text-critical">
          {addSource.error instanceof Error
            ? addSource.error.message
            : "Failed to add source"}
        </p>
      )}
    </div>
  );
}
