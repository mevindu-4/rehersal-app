"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { Button } from "@/components/ui/button";

type Doc = { id: string; filename: string; doc_type: string; created_at: string };

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);

  function load() {
    fetch("/api/documents")
      .then((r) => r.json())
      .then(setDocs);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Resume, decks, and context the avatar can reference"
      />
      <DocumentUploader onUploaded={load} />
      <ul className="mt-8 space-y-2">
        {docs.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-md border border-border px-4 py-3 text-sm"
          >
            <span>
              {d.filename}{" "}
              <span className="text-muted-foreground">({d.doc_type})</span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => remove(d.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
