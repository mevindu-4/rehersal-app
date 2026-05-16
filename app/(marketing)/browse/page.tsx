import { LibraryGrid } from "@/components/library/LibraryGrid";

export default function PublicLibraryPage() {
  return (
    <main className="px-6 py-16">
      <h1 className="text-center text-3xl font-bold">Public figure library</h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        Pre-reconstructed profiles and archetypes. Sign in to clone into your workspace.
      </p>
      <div className="mx-auto mt-12 max-w-5xl">
        <LibraryGrid />
      </div>
    </main>
  );
}
