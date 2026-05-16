import { requireAuth } from "@/lib/api/auth";
import { requireOpenAIConfigured } from "@/lib/api/openaiGate";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { documentBelongsToOrg } from "@/lib/api/org";
import { embedDocument, embedPendingDocuments } from "@/lib/embeddings";
import { EmbedDocumentSchema } from "@/lib/schemas";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const openaiBlock = requireOpenAIConfigured();
  if (openaiBlock) return openaiBlock;

  const limit = checkRateLimit(`embed:${auth.session.user.id}`, {
    maxRequests: 10,
    windowMs: 60_000,
  });
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const parsed = await parseJsonBody(request, EmbedDocumentSchema);
  if ("error" in parsed) return parsed.error;

  if (parsed.data.document_id) {
    const belongs = await documentBelongsToOrg(
      parsed.data.document_id,
      auth.session.organization.id
    );
    if (!belongs) return jsonError("Document not found", 404);

    void embedDocument(parsed.data.document_id);
  } else {
    void embedPendingDocuments(auth.session.organization.id);
  }

  return jsonOk({ message: "Embedding started" }, 202);
}
