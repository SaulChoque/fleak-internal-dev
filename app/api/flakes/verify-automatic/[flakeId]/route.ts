import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAutomaticFlake, verifyDeepLinkSignature } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

const bodySchema = z.object({
  verifierFid: z.string().min(1),
  signature: z.string().min(1),
  completedAt: z.coerce.date().default(() => new Date()),
});

export async function POST(request: NextRequest) {
  try {
    const flakeId = extractFlakeId(request.nextUrl.pathname);
    const body = await request.json();
    const parsed = bodySchema.parse(body);

    await verifyDeepLinkSignature({ flakeId, signature: parsed.signature });
    await verifyAutomaticFlake({
      flakeId,
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

function extractFlakeId(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const verifyIndex = segments.indexOf("verify-automatic");
  const flakeId = verifyIndex >= 0 ? segments[verifyIndex + 1] : undefined;
  if (!flakeId) {
    throw new Error("Unable to resolve flakeId from request path");
  }
  return flakeId;
}
