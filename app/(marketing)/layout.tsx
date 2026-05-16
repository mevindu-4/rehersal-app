import { MarketingNav } from "@/components/marketing/MarketingNav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 mesh-bg opacity-30" aria-hidden />
      <MarketingNav />
      {children}
      <footer className="relative border-t border-white/[0.06] px-6 py-10 text-center text-sm text-muted-foreground">
        <p>
          Rehearsal uses AI avatars for practice simulations. Not affiliated with
          depicted individuals.
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} Rehearsal · Powered by Beyond Presence
        </p>
      </footer>
    </div>
  );
}
