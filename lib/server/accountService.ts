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
  displayName?: string;
  avatarUrl?: string;
  createdAt?: Date;
}

export async function getAccountSummary(fid: string): Promise<AccountSummary> {
  await connectToDatabase();
  const user = await UserModel.findOne({ fid }).lean<{
    fid: string;
    walletAddress?: string;
    displayName?: string;
    avatarUrl?: string;
    streakCount: number;
    friends: string[];
    createdAt?: Date;
  }>();
  if (!user) {
    return {
      fid,
      streakCount: 0,
      friends: [],
      openFlakes: 0,
      resolvedFlakes: 0,
      displayName: undefined,
      avatarUrl: undefined,
      walletAddress: undefined,
      createdAt: undefined,
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
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}
