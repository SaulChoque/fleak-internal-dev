import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getFlakeStatus } from "@/lib/server/flakeService";
import { isAppError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const flakeId = extractFlakeId(request.nextUrl.pathname);
    const status = await getFlakeStatus(flakeId);
    return NextResponse.json(status);
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("/api/flakes/[flakeId]/status error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

function extractFlakeId(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const flakesIndex = segments.indexOf("flakes");
  const flakeId = flakesIndex >= 0 ? segments[flakesIndex + 1] : undefined;
  if (!flakeId) {
    throw new Error("Unable to resolve flakeId from request path");
  }
  return flakeId;
}
