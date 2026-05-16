import { HeroSection } from "@/components/marketing/HeroSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { UseCasesSection } from "@/components/marketing/UseCasesSection";
import { PricingSection } from "@/components/marketing/PricingSection";

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <UseCasesSection />
      <section className="border-y border-white/[0.06] px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Why it works
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Generic roleplay fails because your brain knows the face does not
            matter. When the avatar is reconstructed from how{" "}
            <em>this person</em> actually interviews, invests, or negotiates,
            pressure becomes real. You stop performing answers and start
            adapting to a human you have already met.
          </p>
        </div>
      </section>
      <PricingSection />
    </main>
  );
}
