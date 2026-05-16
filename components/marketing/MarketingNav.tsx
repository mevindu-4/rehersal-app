import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appEntryHref } from "@/lib/auth-config";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 animate-fade-in border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 ring-1 ring-white/10 transition duration-300 group-hover:shadow-glow-sm">
            <Sparkles className="h-4 w-4 text-cyan-400 transition-transform duration-300 group-hover:rotate-12" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-gradient">
            Rehearsal
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="#how-it-works" className="transition-colors duration-200 hover:text-cyan-300">
            How it works
          </Link>
          <Link href="/pricing" className="transition-colors duration-200 hover:text-cyan-300">
            Pricing
          </Link>
          <Link href="/browse" className="transition-colors duration-200 hover:text-cyan-300">
            Library
          </Link>
        </nav>
        <Button asChild size="sm" className="shadow-glow-sm">
          <Link href={appEntryHref()}>Open app</Link>
        </Button>
      </div>
    </header>
  );
}
