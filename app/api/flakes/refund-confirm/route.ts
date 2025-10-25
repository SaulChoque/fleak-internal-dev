import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { markRefundOpened, markRefundClaimed } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

const bodySchema = z.object({
  flakeId: z.string().min(1),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  action: z.enum(["opened", "claimed"]),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.parse(body);

    if (parsed.action === "opened") {
      await markRefundOpened({
        flakeId: parsed.flakeId,
        txHash: parsed.txHash,
      });
    } else {
      await markRefundClaimed({
        flakeId: parsed.flakeId,
        userFid: session.userFid,
        txHash: parsed.txHash,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request", issues: error.issues }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/flakes/refund-confirm error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
