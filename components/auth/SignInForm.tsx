"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Mail } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function getCallbackUrl(next?: string | null): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const url = new URL("/callback", base);
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    url.searchParams.set("next", next);
  }
  return url.toString();
}

export function SignInForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";
  const nextPath = searchParams.get("next");

  const [emailExpanded, setEmailExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    authError
      ? "Sign-in failed. Check Google is enabled in Supabase and redirect URLs include /callback (see docs/GOOGLE_AUTH.md)."
      : null
  );

  async function signInWithGoogle() {
    setLoading("google");
    setError(null);
    setMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getCallbackUrl(nextPath),
          queryParams: { prompt: "select_account" },
        },
      });
      if (oauthError) throw oauthError;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start Google sign-in");
      setLoading(null);
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading("email");
    setError(null);
    setMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: getCallbackUrl(nextPath) },
      });
      if (otpError) throw otpError;
      setMessage("Check your inbox for a magic link to continue.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send magic link");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="border border-border bg-surface p-8 shadow-float animate-fade-in-up">
      <div className="mb-8 text-center">
        <p className="font-display text-h2 text-foreground-primary">Rehearsal</p>
        <p className="mt-1 font-mono text-caption uppercase tracking-wider text-foreground-tertiary">
          Stage-ready practice
        </p>
      </div>

      <h1 className="text-center font-display text-h1 text-foreground-primary">
        Sign in to Rehearsal
      </h1>
      <p className="mt-2 text-center text-body text-foreground-secondary">
        Have the conversation before you have it.
      </p>

      <div className="mt-8 space-y-3">
        <Button
          type="button"
          className="w-full"
          size="lg"
          disabled={loading !== null}
          onClick={signInWithGoogle}
        >
          {loading === "google" ? (
            "Redirecting…"
          ) : (
            <>
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </>
          )}
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-subtle" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-3 font-mono text-caption uppercase text-foreground-tertiary">
              or
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          size="lg"
          disabled={loading !== null}
          onClick={() => setEmailExpanded((v) => !v)}
        >
          <Mail className="h-4 w-4" strokeWidth={1.5} />
          Continue with email
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 transition-transform duration-standard",
              emailExpanded && "rotate-180"
            )}
            strokeWidth={1.5}
          />
        </Button>

        {emailExpanded && (
          <form onSubmit={sendMagicLink} className="space-y-4 pt-2 animate-fade-in-up">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading !== null}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading !== null || !email.trim()}
            >
              {loading === "email" ? "Sending…" : "Send magic link"}
            </Button>
          </form>
        )}
      </div>

      {message && (
        <p className="mt-4 text-center text-small text-success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 text-center text-small text-critical" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
