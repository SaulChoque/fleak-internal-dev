import { connectToDatabase } from "@/lib/db";
import { UserModel, UserDocument } from "@/lib/models/User";

export interface UpsertUserInput {
  fid: string;
  walletAddress?: string;
  displayName?: string;
  avatarUrl?: string;
}

export async function upsertUser(input: UpsertUserInput): Promise<UserDocument> {
  await connectToDatabase();
  const user = await UserModel.findOneAndUpdate(
    { fid: input.fid },
    {
      $setOnInsert: { streakCount: 0, friends: [] },
      $set: {
        walletAddress: input.walletAddress,
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
      },
    },
    { upsert: true, new: true }
  );

  return user;
}
