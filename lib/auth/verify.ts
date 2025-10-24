import { Errors, createClient } from "@farcaster/quick-auth";
import { AppError } from "@/lib/errors";

const client = createClient();

interface VerifyResult {
  fid: string;
}

export async function verifyCbAuthToken(token: string, domain: string): Promise<VerifyResult> {
  try {
    const payload = await client.verifyJwt({ token, domain });
  return { fid: String(payload.sub) };
  } catch (error) {
    if (error instanceof Errors.InvalidTokenError) {
      throw new AppError("Invalid authentication token", 401);
    }

    throw new AppError("Unable to verify authentication token", 500, error);
  }
}
