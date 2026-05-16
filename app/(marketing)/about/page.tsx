import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";

export default function AboutPage() {
  return (
    <main className="py-12">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h1 className="text-4xl font-bold">How Rehearsal works</h1>
        <p className="mt-4 text-muted-foreground">
          A person reconstruction engine — not a scenario library.
        </p>
      </div>
      <HowItWorksSection />
    </main>
  );
}
