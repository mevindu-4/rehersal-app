/** Set DISABLE_AUTH=true in .env.local to skip login during development. */
export function isAuthDisabled(): boolean {
  return process.env.DISABLE_AUTH === "true";
}

export function appEntryHref(): string {
  return isAuthDisabled() ? "/dashboard" : "/login";
}

export const DEV_USER_EMAIL =
  process.env.DEV_USER_EMAIL ?? "dev@rehearsal.local";
