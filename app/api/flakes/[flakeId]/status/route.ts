import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getFlakeStatus } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

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
    const status = await getFlakeStatus(params.flakeId);
    return NextResponse.json(status);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/flakes/[flakeId]/status error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
