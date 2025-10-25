import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { attachEvidence } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

const bodySchema = z.object({
  cid: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().nonnegative(),
  title: z.string().optional(),
  flakeId: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const inferredFlakeId = extractFlakeId(request.nextUrl.pathname);
    const body = await request.json();
    const parsed = bodySchema.parse(body);

    const flake = await attachEvidence({
      flakeId: parsed.flakeId ?? inferredFlakeId,
      uploaderFid: session.userFid,
      cid: parsed.cid,
      mimeType: parsed.mimeType,
      sizeBytes: parsed.sizeBytes,
      title: parsed.title,
    });

    return NextResponse.json({ evidenceCount: flake.evidence.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request", issues: error.issues }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/flakes/[flakeId]/evidence error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

function extractFlakeId(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const flakesIndex = segments.indexOf("flakes");
  const flakeId = flakesIndex >= 0 ? segments[flakesIndex + 1] : undefined;
  if (!flakeId) {
    throw new Error("Unable to resolve flakeId from request path");
  }
  return flakeId;
}
