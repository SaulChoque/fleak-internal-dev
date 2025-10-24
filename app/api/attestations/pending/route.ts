import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listPendingAttestations } from "@/lib/server/flakeService";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const attestations = await listPendingAttestations(session.userFid);
  return NextResponse.json({ items: attestations });
}
