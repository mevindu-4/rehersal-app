import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export function jsonOk<T>(body: T, status = 200): NextResponse {
  return NextResponse.json(body, { status });
}

export function jsonError(
  message: string,
  status: number,
  code?: string
): NextResponse {
  return NextResponse.json(
    { error: message, ...(code ? { code } : {}) },
    { status }
  );
}

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { error: jsonError("Invalid JSON body", 400, "INVALID_JSON") };
  }

  try {
    return { data: schema.parse(raw) };
  } catch (e) {
    if (e instanceof ZodError) {
      const message = e.errors.map((err) => err.message).join("; ");
      return { error: jsonError(message, 400, "VALIDATION_ERROR") };
    }
    throw e;
  }
}
