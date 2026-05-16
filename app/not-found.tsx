import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="font-mono text-caption uppercase text-foreground-tertiary">
        404
      </p>
      <h1 className="mt-2 font-display text-display-2 text-foreground-primary">
        Off script
      </h1>
      <p className="mt-4 max-w-md text-body text-foreground-secondary">
        This page doesn&apos;t exist. Head back to your dashboard to continue rehearsing.
      </p>
      <Button className="mt-8" asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
