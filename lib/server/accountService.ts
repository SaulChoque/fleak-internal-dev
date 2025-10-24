import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/lib/models/User";
import { FlakeModel } from "@/lib/models/Flake";

export interface AccountSummary {
  fid: string;
  walletAddress?: string;
  streakCount: number;
  openFlakes: number;
  resolvedFlakes: number;
  friends: string[];
}

export async function getAccountSummary(fid: string): Promise<AccountSummary> {
  await connectToDatabase();
  const user = await UserModel.findOne({ fid }).lean();
  if (!user) {
    return {
      fid,
      streakCount: 0,
      friends: [],
      openFlakes: 0,
      resolvedFlakes: 0,
    };
  }

  const [openFlakes, resolvedFlakes] = await Promise.all([
    FlakeModel.countDocuments({ creatorFid: fid, status: { $ne: "RESOLVED" } }),
    FlakeModel.countDocuments({ creatorFid: fid, status: "RESOLVED" }),
  ]);

  return {
    fid: user.fid,
    walletAddress: user.walletAddress,
    streakCount: user.streakCount,
    friends: user.friends,
    openFlakes,
    resolvedFlakes,
  };
}
