import {
  Briefcase,
  TrendingUp,
  Phone,
  MessageCircleWarning,
  Mic,
  Scale,
} from "lucide-react";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const useCases = [
  { icon: Briefcase, title: "Job Interview", description: "Practice with the actual hiring manager before tomorrow." },
  { icon: TrendingUp, title: "Fundraising Pitch", description: "Rehearse with a specific VC partner's known thesis and objections." },
  { icon: Phone, title: "Sales Discovery", description: "Face a skeptical buyer who matches your prospect's style." },
  { icon: MessageCircleWarning, title: "Difficult Conversations", description: "Prepare for feedback, conflict, or performance reviews." },
  { icon: Mic, title: "Podcast Prep", description: "Anticipate how a host probes stories and challenges claims." },
  { icon: Scale, title: "Deposition Prep", description: "Cross-examination style practice with opposing counsel patterns." },
];

export function UseCasesSection() {
  return (
    <section className="px-6 py-20">
      <AnimatedReveal className="mx-auto max-w-5xl">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
          Use cases
        </p>
        <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight md:text-4xl">
          Every high-stakes conversation
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((uc, i) => (
            <AnimatedReveal key={uc.title} delay={i * 60}>
              <Card className="group h-full border-shine hover-lift bg-card/40">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-white/10 transition duration-300 group-hover:shadow-glow-sm">
                    <uc.icon className="h-5 w-5 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <CardTitle className="text-base">{uc.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{uc.description}</p>
                </CardContent>
              </Card>
            </AnimatedReveal>
          ))}
        </div>
      </AnimatedReveal>
    </section>
  );
}
