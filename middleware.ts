import { isAuthDisabled } from "@/lib/auth-config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieToSet } from "@/lib/supabase/cookies";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (isAuthDisabled()) {
    if (path === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAppRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/targets") ||
    path.startsWith("/documents") ||
    path.startsWith("/scenarios") ||
    path.startsWith("/sessions") ||
    path.startsWith("/reports") ||
    path.startsWith("/library") ||
    path.startsWith("/progress") ||
    path.startsWith("/admin") ||
    path.startsWith("/settings");

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  if (path === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/targets/:path*",
    "/documents/:path*",
    "/scenarios/:path*",
    "/sessions/:path*",
    "/reports",
    "/reports/:path*",
    "/library/:path*",
    "/progress/:path*",
    "/admin/:path*",
    "/settings/:path*",
    "/login",
  ],
};
