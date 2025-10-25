import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { openRefunds } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

const bodySchema = z.object({
  flakeId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.parse(body);

    const result = await openRefunds(parsed.flakeId);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request", issues: error.issues }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/flakes/refund-open error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
