import Link from "next/link";
import { AnimatedReveal } from "@/components/shared/AnimatedReveal";
import { appEntryHref } from "@/lib/auth-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PricingSection() {
  return (
    <section className="border-t border-border px-6 py-20">
      <AnimatedReveal className="mx-auto max-w-lg text-center">
        <h2 className="text-3xl font-bold">Pilot offer</h2>
        <p className="mt-4 text-muted-foreground">
          Join early teams getting access to person-specific rehearsal. Limited
          pilot slots for coaches, bootcamps, and interview prep programs.
        </p>
        <Card className="mt-8 border-shine text-left hover-lift">
          <CardHeader>
            <CardTitle>Founding pilot</CardTitle>
            <CardDescription>10 sessions · 3 custom targets · team dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={appEntryHref()}>Request pilot access</Link>
            </Button>
          </CardContent>
        </Card>
      </AnimatedReveal>
    </section>
  );
}
