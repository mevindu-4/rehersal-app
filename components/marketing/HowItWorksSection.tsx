import { UserSearch, FileUp, Video } from "lucide-react";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: UserSearch,
    title: "Build the target profile",
    description:
      "Paste LinkedIn URLs, podcasts, articles, or describe them manually. We synthesize how they communicate and what they care about.",
  },
  {
    icon: FileUp,
    title: "Upload your context",
    description:
      "Add your resume, pitch deck, or deal notes. The avatar references your real background during the conversation.",
  },
  {
    icon: Video,
    title: "Rehearse with their avatar",
    description:
      "Live video session with a Beyond Presence avatar in character. End with a report specific to that person.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-white/[0.06] px-6 py-24">
      <AnimatedReveal className="mx-auto max-w-5xl">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
          Workflow
        </p>
        <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight md:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Three steps from public information to a conversation you have already had.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <AnimatedReveal key={step.title} delay={i * 90}>
              <Card className="group h-full border-shine hover-lift">
                <CardHeader>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/15 to-violet-500/10 ring-1 ring-white/10 transition duration-300 group-hover:shadow-glow-sm">
                    <step.icon className="h-5 w-5 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <p className="font-mono text-xs text-cyan-400/80">0{i + 1}</p>
                  <CardTitle className="text-lg font-medium">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </AnimatedReveal>
          ))}
        </div>
      </AnimatedReveal>
    </section>
  );
}
