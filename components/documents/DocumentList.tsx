"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { DOC_TYPE_LABELS } from "@/lib/constants";
import { useDocuments } from "@/lib/hooks/use-api";
import { formatDate } from "@/lib/utils";
import type { UserDocument } from "@/types";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({
  documents: externalDocs,
  endpoint = "/api/documents",
  onRefetch,
}: {
  documents?: UserDocument[];
  endpoint?: string;
  onRefetch?: () => void;
} = {}) {
  const { data, isLoading, refetch } = useDocuments();
  const documents = useMemo(
    () => externalDocs ?? data?.documents ?? [],
    [externalDocs, data?.documents]
  );
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((d) => d.filename.toLowerCase().includes(q));
  }, [documents, search]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${endpoint}/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Delete failed");
      }
      setDeleteId(null);
      await refetch();
      onRefetch?.();
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading && !externalDocs) return <LoadingSkeleton rows={5} />;

  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents yet"
        description="Upload background, opportunity notes, or product context for richer rehearsals."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search documents…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-small">
          <thead className="border-b border-border bg-surface-elevated">
            <tr>
              <th className="px-4 py-3 font-mono text-caption uppercase text-foreground-tertiary">
                Filename
              </th>
              <th className="px-4 py-3 font-mono text-caption uppercase text-foreground-tertiary">
                Type
              </th>
              <th className="px-4 py-3 font-mono text-caption uppercase text-foreground-tertiary">
                Date
              </th>
              <th className="px-4 py-3 font-mono text-caption uppercase text-foreground-tertiary">
                Size
              </th>
              <th className="px-4 py-3 font-mono text-caption uppercase text-foreground-tertiary">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => (
              <tr key={doc.id} className="border-b border-border-subtle last:border-0">
                <td className="px-4 py-3 text-foreground-primary">{doc.filename}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{DOC_TYPE_LABELS[doc.doc_type]}</Badge>
                </td>
                <td className="px-4 py-3 text-foreground-secondary">
                  {formatDate(doc.created_at)}
                </td>
                <td className="px-4 py-3 font-mono text-foreground-tertiary">
                  {formatSize(doc.file_size_bytes)}
                </td>
                <td className="px-4 py-3 capitalize text-foreground-secondary">
                  {doc.embedding_status}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete"
                    onClick={() => setDeleteId(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete document?"
        description="This removes the file and its embeddings. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
