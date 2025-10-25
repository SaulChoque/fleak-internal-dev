import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";
import { connectToDatabase } from "@/lib/db";
import { SessionModel } from "@/lib/models/Session";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "fleak_session";
const SESSION_TTL_HOURS = 24;

export interface SessionPayload {
  sessionId: string;
  userFid: string;
}

export async function createSession(userFid: string) {
  await connectToDatabase();
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  await SessionModel.create({ sessionId, userFid, expiresAt });

  const env = getEnv();
  const secret = new TextEncoder().encode(env.SESSION_SECRET);
  const jwt = await new SignJWT({ sessionId, userFid })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV !== "development",
    expires: expiresAt,
    path: "/",
  });

  return { sessionId, jwt, expiresAt };
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const env = getEnv();
    const secret = new TextEncoder().encode(env.SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (typeof payload.sessionId !== "string" || typeof payload.userFid !== "string") {
      return null;
    }

    await connectToDatabase();
    const session = await SessionModel.findOne({ sessionId: payload.sessionId }).lean<{
      sessionId: string;
      userFid: string;
      expiresAt: Date;
    }>();
    if (!session) {
      return null;
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await SessionModel.deleteOne({ sessionId: payload.sessionId });
      return null;
    }

    return { sessionId: payload.sessionId, userFid: payload.userFid };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const existingSession = await getSession();
  if (existingSession) {
    await connectToDatabase();
    await SessionModel.deleteOne({ sessionId: existingSession.sessionId });
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
