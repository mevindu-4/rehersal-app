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

export default function DocumentsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-2 text-foreground-primary">
            Documents
          </h1>
          <p className="mt-2 text-body text-foreground-secondary">
            Background and context the avatar can reference in rehearsals.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Upload
        </Button>
      </div>

      <DocumentList />

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-h2">Upload document</DialogTitle>
          </DialogHeader>
          <DocumentUploader onClose={() => setUploadOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
