import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAccountSummary } from "@/lib/server/accountService";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const summary = await getAccountSummary(session.userFid);
  return NextResponse.json(summary);
}
