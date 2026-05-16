import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appEntryHref } from "@/lib/auth-config";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-16 md:pt-24">
      <div
        className="pointer-events-none absolute inset-0 mesh-bg mesh-bg-animated opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[120px] animate-glow-pulse"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-32 h-40 w-40 rounded-full bg-violet-500/10 blur-[60px] animate-float-slow"
        aria-hidden
      />
      <div className="relative mx-auto max-w-5xl text-center">
        <p className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/90 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse-soft" />
          </span>
          Powered by Beyond Presence
        </p>
        <h1 className="animate-fade-up text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl opacity-0 stagger-1 [animation-fill-mode:forwards]">
          Have the conversation
          <br />
          <span className="text-gradient-animated">before you have it.</span>
        </h1>
        <p className="animate-fade-up mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground opacity-0 md:text-xl stagger-2 [animation-fill-mode:forwards]">
          Rehearsal builds a digital twin of the person you are about to face — from
          LinkedIn, podcasts, and your context — so you practice with their
          questions, not a generic script.
        </p>
        <div className="animate-fade-up mt-12 flex flex-col items-center justify-center gap-4 opacity-0 sm:flex-row stagger-3 [animation-fill-mode:forwards]">
          <Button asChild size="lg" className="min-w-[160px]">
            <Link href={appEntryHref()}>Start rehearsing</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[160px]">
            <Link href="#how-it-works">How it works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
