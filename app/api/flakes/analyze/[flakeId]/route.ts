import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requestAiReview } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/db";
import { FlakeModel, AttestationEntry } from "@/lib/models/Flake";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const flakeId = extractFlakeId(request.nextUrl.pathname);
    const result = await requestAiReview(flakeId);
    return NextResponse.json(result);
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/flakes/analyze/[flakeId] POST error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const flakeId = extractFlakeId(request.nextUrl.pathname);
    await connectToDatabase();
    const flake = await FlakeModel.findOne({ flakeId }).lean<{
      attestations: AttestationEntry[];
    }>();
    if (!flake) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const aiAttestation = flake.attestations
      .filter((attestation: AttestationEntry) => attestation.attestorFid === "ai")
      .sort((a: AttestationEntry, b: AttestationEntry) => b.submittedAt.getTime() - a.submittedAt.getTime())[0];

    return NextResponse.json({
      score: aiAttestation?.aiScore ?? null,
      rationale: aiAttestation?.aiRationale ?? null,
      updatedAt: aiAttestation?.submittedAt ?? null,
    });
  } catch (error) {
    console.error("/api/flakes/analyze/[flakeId] GET error", error);
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
