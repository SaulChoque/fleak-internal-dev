import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { sendFriendRequest } from "@/lib/server/friendService";

const bodySchema = z.object({
  targetFid: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.parse(body);

    await sendFriendRequest({ requesterFid: session.userFid, targetFid: parsed.targetFid });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("/api/friends/request error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}
