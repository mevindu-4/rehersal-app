import type { AuthSession } from "@/lib/auth";
import { canManageTeam, getSession } from "@/lib/auth";
import type { Role } from "@/types";
import { jsonError } from "./http";

export async function requireAuth():
  Promise<{ session: AuthSession } | { error: Response }> {
  const session = await getSession();
  if (!session) {
    return { error: jsonError("Unauthorized", 401, "UNAUTHORIZED") };
  }
  return { session };
}

export function requireRoles(
  session: AuthSession,
  roles: Role[]
): Response | null {
  if (!roles.includes(session.membership.role)) {
    return jsonError("Forbidden", 403, "FORBIDDEN");
  }
  return null;
}

export function requireCoach(session: AuthSession): Response | null {
  if (!canManageTeam(session.membership.role)) {
    return jsonError("Forbidden", 403, "FORBIDDEN");
  }
  return null;
}

export function requireOwner(session: AuthSession): Response | null {
  if (session.membership.role !== "owner") {
    return jsonError("Forbidden", 403, "FORBIDDEN");
  }
  return null;
}
