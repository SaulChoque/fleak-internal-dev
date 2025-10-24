import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAutomaticFlake, verifyDeepLinkSignature } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

const bodySchema = z.object({
  verifierFid: z.string().min(1),
  signature: z.string().min(1),
  completedAt: z.coerce.date().default(() => new Date()),
});

const paramsSchema = z.object({
  flakeId: z.string().min(1),
});

export async function POST(request: NextRequest, context: { params: unknown }) {
  try {
    const params = paramsSchema.parse(context.params);
    const body = await request.json();
    const parsed = bodySchema.parse(body);

    await verifyDeepLinkSignature({ flakeId: params.flakeId, signature: parsed.signature });
    await verifyAutomaticFlake({
      flakeId: params.flakeId,
      verifierFid: parsed.verifierFid,
      completedAt: parsed.completedAt,
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request", issues: error.issues }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/flakes/verify-automatic error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
