"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function otpErrorMessage(error: { message: string; status?: number }) {
  const msg = error.message.toLowerCase();
  if (
    error.status === 429 ||
    msg.includes("rate") ||
    msg.includes("too many")
  ) {
    return "Too many sign-in emails sent. Wait about an hour, or use Continue with Google.";
  }
  return error.message;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  function startCooldown(seconds: number) {
    setCooldownSec(seconds);
    const id = window.setInterval(() => {
      setCooldownSec((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (cooldownSec > 0) return;
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    setLoading(false);
    if (error) {
      setMessage(otpErrorMessage(error));
      if (error.status === 429) startCooldown(300);
      else startCooldown(60);
    } else {
      setMessage("Check your email for the magic link.");
      startCooldown(60);
    }
  }

  async function signInWithGoogle() {
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("not enabled") || msg.includes("unsupported provider")) {
        setMessage(
          "Google sign-in is not enabled in Supabase. Enable it under Authentication → Providers, or use the magic link below."
        );
      } else {
        setMessage(error.message);
      }
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in to Rehearsal</CardTitle>
        <CardDescription>
          Practice the real conversation before it happens.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle}>
          Continue with Google
        </Button>
        <p className="text-center text-xs text-muted-foreground">or</p>
        <form onSubmit={signInWithMagicLink} className="space-y-3">
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading || cooldownSec > 0}
          >
            {loading
              ? "Sending…"
              : cooldownSec > 0
                ? `Resend in ${cooldownSec}s`
                : "Send magic link"}
          </Button>
        </form>
        {message && (
          <p className="text-center text-sm text-muted-foreground">{message}</p>
        )}
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="pointer-events-none fixed inset-0 mesh-bg opacity-40" aria-hidden />
      <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
