import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getFinanceSnapshot } from "@/lib/server/financeService";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getFinanceSnapshot(session.userFid);
  return NextResponse.json(snapshot);
}
