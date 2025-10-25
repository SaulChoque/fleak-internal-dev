import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { FlakeModel, FlakeStatus, Participant, AttestationEntry } from "@/lib/models/Flake";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const flakeId = extractFlakeId(request.nextUrl.pathname);
    const flake = await FlakeModel.findOne({ flakeId }).lean<{
      status: FlakeStatus;
      attestations: AttestationEntry[];
      participants: Participant[];
    }>();
    if (!flake) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: flake.status,
      attestations: flake.attestations,
      participants: flake.participants,
    });
  } catch (error) {
    console.error("/api/flakes/[flakeId]/resolution error", error);
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
