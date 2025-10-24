import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getDepositStatus } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

const querySchema = z.object({
  flakeId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse({ flakeId: searchParams.get("flakeId") });
    const status = await getDepositStatus(parsed.flakeId);
    return NextResponse.json(status);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid query", issues: error.issues }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/flakes/deposit-status error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
