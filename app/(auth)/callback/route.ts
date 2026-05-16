import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db";
import { provisionNewUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  if (code) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      let isNewUser = false;
      if (!existingUser) {
        isNewUser = true;
        await provisionNewUser({
          userId: data.user.id,
          email: data.user.email ?? "",
          name: data.user.user_metadata?.full_name,
          avatarUrl: data.user.user_metadata?.avatar_url,
        });
      }

      const defaultNext = isNewUser ? "/onboarding" : "/dashboard";
      const next =
        nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
          ? nextParam
          : defaultNext;
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth`);
}
