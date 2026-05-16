"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DocumentTypeSelector } from "@/components/documents/DocumentTypeSelector";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { useDocuments } from "@/lib/hooks/use-api";
import { cn } from "@/lib/utils";
import type { DocType, FileType } from "@/types";

function fileTypeFromName(name: string): FileType {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  return "txt";
}

type Stage = "idle" | "uploading" | "registering" | "embedding" | "ready" | "error";

export function DocumentUploader({
  onClose,
  isCompanyShared = false,
}: {
  onClose?: () => void;
  isCompanyShared?: boolean;
}) {
  const { refetch } = useDocuments();
  const [docType, setDocType] = useState<DocType>("my_background");
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pendingDocId, setPendingDocId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: docsData } = useDocuments();
  const pendingDoc = docsData?.documents.find((d) => d.id === pendingDocId);

  useEffect(() => {
    if (!pendingDocId || !pendingDoc) return;
    if (pendingDoc.embedding_status === "complete") {
      setStage("ready");
      setProgress(100);
      void refetch();
      return;
    }
    if (pendingDoc.embedding_status === "failed") {
      setStage("error");
      setError("Embedding failed. Try re-uploading.");
      return;
    }
    if (stage === "registering") {
      setStage("embedding");
      setProgress(75);
    }
  }, [pendingDoc, pendingDocId, refetch, stage]);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setStage("uploading");
      setProgress(20);

      const supabase = createBrowserSupabaseClient();
      const path = `${crypto.randomUUID()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setStage("error");
        setError(uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
      setProgress(50);
      setStage("registering");

      const endpoint = isCompanyShared ? "/api/company-documents" : "/api/documents";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          file_url: urlData.publicUrl,
          file_size_bytes: file.size,
          file_type: fileTypeFromName(file.name),
          doc_type: docType,
          is_company_shared: isCompanyShared,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStage("error");
        setError(body.error ?? "Failed to register document");
        return;
      }

      setPendingDocId(body.document?.id ?? null);
      setStage("embedding");
      setProgress(75);
      void refetch();
    },
    [docType, isCompanyShared, refetch]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) void uploadFile(file);
    },
    [uploadFile]
  );

  const stageLabel: Record<Stage, string> = {
    idle: "Drop a file or click to browse",
    uploading: "Uploading…",
    registering: "Processing text…",
    embedding: "Embedding…",
    ready: "Ready",
    error: error ?? "Upload failed",
  };

  return (
    <div className="space-y-4">
      <DocumentTypeSelector value={docType} onChange={setDocType} />

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 transition-colors",
          dragOver ? "border-accent bg-highlight-glow" : "border-border hover:border-border-default"
        )}
      >
        <Upload className="h-8 w-8 text-foreground-tertiary" strokeWidth={1.5} />
        <p className="mt-3 text-body text-foreground-secondary">{stageLabel[stage]}</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
          }}
        />
      </div>

      {stage !== "idle" && stage !== "error" && (
        <Progress value={progress} className="h-2" />
      )}

      {error && <p className="text-small text-critical">{error}</p>}

      <div className="flex justify-end gap-2">
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            {stage === "ready" ? "Done" : "Cancel"}
          </Button>
        )}
      </div>
    </div>
  );
}
