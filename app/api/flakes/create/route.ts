import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createFlake } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

const bodySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  stakeAmount: z.string().min(1),
  verificationType: z.enum(["automatic", "social", "ai"]),
  deadline: z.coerce.date(),
  participants: z
    .array(
      z.object({
        fid: z.string().min(1),
        stakeAmount: z.string().min(1),
      })
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.parse(body);

    const flake = await createFlake({
      creatorFid: session.userFid,
      title: parsed.title,
      description: parsed.description,
      stakeAmount: parsed.stakeAmount,
      verificationType: parsed.verificationType,
      deadline: parsed.deadline,
      participants: parsed.participants,
    });

    return NextResponse.json({ flake });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request", issues: error.issues }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ message: error.message, details: error.details }, { status: error.status });
    }

    console.error("/api/flakes/create error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
