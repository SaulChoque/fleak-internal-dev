import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/auth/logout error", error);
    return NextResponse.json({ message: "Unable to clear the session" }, { status: 500 });
  }
}
