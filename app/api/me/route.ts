import { requireAuth } from "@/lib/api/auth";
import { jsonOk } from "@/lib/api/http";

/** Current user, org, and membership for app shell / client hooks. */
export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  return jsonOk({
    user: auth.session.user,
    organization: auth.session.organization,
    membership: auth.session.membership,
  });
}
