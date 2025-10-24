import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { submitAttestation } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

const bodySchema = z.object({
  flakeId: z.string().min(1),
  verdict: z.enum(["approved", "rejected", "abstain"]),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.parse(body);

    const flake = await submitAttestation({
      flakeId: parsed.flakeId,
      attestorFid: session.userFid,
      verdict: parsed.verdict,
      notes: parsed.notes,
    });

    return NextResponse.json({ attestationCount: flake.attestations.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request", issues: error.issues }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/attestations/submit error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
