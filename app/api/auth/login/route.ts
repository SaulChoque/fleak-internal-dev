import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCbAuthToken } from "@/lib/auth/verify";
import { upsertUser } from "@/lib/server/userService";
import { createSession } from "@/lib/auth/session";
import { getAccountSummary } from "@/lib/server/accountService";
import { AppError, isAppError } from "@/lib/errors";

const bodySchema = z.object({
  token: z.string().min(1),
  walletAddress: z.string().optional(),
  displayName: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, walletAddress, displayName, avatarUrl } = bodySchema.parse(body);

    const domain = getDomainFromRequest(request);
    const { fid } = await verifyCbAuthToken(token, domain);

    const user = await upsertUser({ fid, walletAddress, displayName, avatarUrl });
    await createSession(fid);
    const summary = await getAccountSummary(fid);

    return NextResponse.json({
      user: {
        fid: user.fid,
        walletAddress: user.walletAddress,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      account: summary,
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ message: error.message, details: error.details }, { status: error.status });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request", issues: error.issues }, { status: 400 });
    }

    console.error("/api/auth/login error", error);
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
  }
}

function getDomainFromRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host;
    } catch {
      // ignore invalid origin
    }
  }

  const host = request.headers.get("host");
  if (host) {
    return host;
  }

  throw new AppError("Unable to determine request domain", 400);
}
