import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { requestAiReview } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/db";
import { FlakeModel } from "@/lib/models/Flake";

const paramsSchema = z.object({
  flakeId: z.string().min(1),
});

export async function POST(_: NextRequest, context: { params: unknown }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = paramsSchema.parse(context.params);
    const result = await requestAiReview(params.flakeId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/flakes/analyze/[flakeId] POST error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

export async function GET(_: NextRequest, context: { params: unknown }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = paramsSchema.parse(context.params);
    await connectToDatabase();
    const flake = await FlakeModel.findOne({ flakeId: params.flakeId }).lean();
    if (!flake) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const aiAttestation = flake.attestations
      .filter((attestation) => attestation.attestorFid === "ai")
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())[0];

    return NextResponse.json({
      score: aiAttestation?.aiScore ?? null,
      rationale: aiAttestation?.aiRationale ?? null,
      updatedAt: aiAttestation?.submittedAt ?? null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    console.error("/api/flakes/analyze/[flakeId] GET error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
