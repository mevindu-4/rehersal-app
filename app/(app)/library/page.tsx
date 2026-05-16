import { LibraryBrowser } from "@/components/library/LibraryBrowser";

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-display-2 text-foreground-primary">
          Library
        </h1>
        <p className="mt-2 text-body text-foreground-secondary">
          Ready-made personalities — investors, interviewers, and more. Clone to your workspace.
        </p>
      </div>
      <LibraryBrowser />
    </div>
  );
}
