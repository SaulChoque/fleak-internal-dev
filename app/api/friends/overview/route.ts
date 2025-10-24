import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getFriendOverview } from "@/lib/server/friendService";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const overview = await getFriendOverview(session.userFid);
  return NextResponse.json(overview);
}
