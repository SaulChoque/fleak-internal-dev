import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { FlakeModel } from "@/lib/models/Flake";

const querySchema = z.object({
  flakeId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse({ flakeId: searchParams.get("flakeId") });
    await connectToDatabase();
    const flake = await FlakeModel.findOne({ flakeId: parsed.flakeId }).lean();
    if (!flake) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      flakeId: flake.flakeId,
      title: flake.title,
      verificationType: flake.verificationType,
      deadline: flake.deadline,
      deepLink: flake.deepLink,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid query", issues: error.issues }, { status: 400 });
    }

    console.error("/api/flakes/details error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
