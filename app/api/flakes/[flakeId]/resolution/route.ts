import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import { FlakeModel } from "@/lib/models/Flake";

const paramsSchema = z.object({
  flakeId: z.string().min(1),
});

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

    return NextResponse.json({
      status: flake.status,
      attestations: flake.attestations,
      participants: flake.participants,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    console.error("/api/flakes/[flakeId]/resolution error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
