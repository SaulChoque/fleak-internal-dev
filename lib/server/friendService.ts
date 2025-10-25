import { connectToDatabase } from "@/lib/db";
import { FriendRequestModel } from "@/lib/models/FriendRequest";
import { UserModel } from "@/lib/models/User";

export interface FriendListResponse {
  friends: Array<{ fid: string; displayName?: string; avatarUrl?: string }>;
  outgoingRequests: Array<{ fid: string; createdAt: Date }>;
  incomingRequests: Array<{ fid: string; createdAt: Date }>;
}

export async function getFriendOverview(fid: string): Promise<FriendListResponse> {
  await connectToDatabase();
  const user = await UserModel.findOne({ fid }).lean<{
    fid: string;
    friends?: string[];
  }>();

  const [outgoing, incoming] = await Promise.all([
    FriendRequestModel.find({ requesterFid: fid, status: "pending" })
      .sort({ createdAt: -1 })
      .lean<Array<{ targetFid: string; createdAt: Date }>>(),
    FriendRequestModel.find({ targetFid: fid, status: "pending" })
      .sort({ createdAt: -1 })
      .lean<Array<{ requesterFid: string; createdAt: Date }>>(),
  ]);

  const friendDocs = user?.friends?.length
    ? await UserModel.find({ fid: { $in: user.friends } }).lean<Array<{
        fid: string;
        displayName?: string;
        avatarUrl?: string;
      }>>()
    : [];

  return {
    friends:
      friendDocs?.map((friend) => ({
        fid: friend.fid,
        displayName: friend.displayName,
        avatarUrl: friend.avatarUrl,
      })) ?? [],
    outgoingRequests: outgoing.map((req) => ({ fid: req.targetFid, createdAt: req.createdAt })),
    incomingRequests: incoming.map((req) => ({ fid: req.requesterFid, createdAt: req.createdAt })),
  };
}

export async function sendFriendRequest({
  requesterFid,
  targetFid,
}: {
  requesterFid: string;
  targetFid: string;
}) {
  if (requesterFid === targetFid) {
    throw new Error("Cannot send friend request to self");
  }

  await connectToDatabase();

  await FriendRequestModel.findOneAndUpdate(
    { requesterFid, targetFid },
    { $setOnInsert: { status: "pending" } },
    { upsert: true, new: true }
  );
}
