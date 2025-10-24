import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { markResolution } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

const bodySchema = z.object({
  flakeId: z.string().min(1),
  winnerFid: z.string().min(1),
  winnerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.parse(body);

    const resolution = await markResolution({
      flakeId: parsed.flakeId,
      winnerFid: parsed.winnerFid,
      winnerAddress: parsed.winnerAddress as `0x${string}`,
    });

    return NextResponse.json(resolution);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request", issues: error.issues }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/flakes/resolve error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
