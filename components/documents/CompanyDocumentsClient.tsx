"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { useCompanyDocuments } from "@/lib/hooks/use-api";
import type { AuthSession } from "@/lib/auth-types";

export function CompanyDocumentsClient({ session }: { session: AuthSession }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data, refetch } = useCompanyDocuments();
  const canUpload = session.membership.role === "owner";

  return (
    <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-2 text-foreground-primary">
            Company documents
          </h1>
          <p className="mt-2 text-body text-foreground-secondary">
            Shared context for your team — product info, policies, and company background.
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Upload
          </Button>
        )}
      </div>

      <DocumentList
        documents={data?.documents}
        endpoint="/api/company-documents"
        onRefetch={() => void refetch()}
      />

      {canUpload && (
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-h2">
                Upload company document
              </DialogTitle>
            </DialogHeader>
            <DocumentUploader
              isCompanyShared
              onClose={() => setUploadOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
