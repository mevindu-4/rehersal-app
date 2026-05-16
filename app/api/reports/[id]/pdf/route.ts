import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { reportBelongsToOrg } from "@/lib/api/org";
import { exportReportPdf } from "@/lib/pdfExporter";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

type RouteContext = { params: { id: string } };

export async function POST(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const limit = checkRateLimit(`pdf:${auth.session.user.id}`, {
    maxRequests: 5,
    windowMs: 60_000,
  });
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const belongs = await reportBelongsToOrg(
    params.id,
    auth.session.organization.id
  );
  if (!belongs) return jsonError("Report not found", 404);

  try {
    const pdf_url = await exportReportPdf(params.id);
    return jsonOk({ pdf_url });
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "PDF export failed",
      500
    );
  }
}
