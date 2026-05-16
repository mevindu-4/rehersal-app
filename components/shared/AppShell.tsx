export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 mesh-bg mesh-bg-animated opacity-30"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -left-32 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px] animate-float"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -right-32 bottom-20 h-80 w-80 rounded-full bg-violet-600/10 blur-[120px] animate-float-slow [animation-delay:1.5s]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-500/5 blur-[80px] animate-glow-pulse"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
