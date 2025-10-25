import { connectToDatabase } from "@/lib/db";
import { FriendRequestModel } from "@/lib/models/FriendRequest";
import { UserModel } from "@/lib/models/User";

export interface FriendOverviewEntry {
  fid: string;
  displayName?: string;
  avatarUrl?: string;
  streakCount?: number;
  createdAt?: Date;
}

export interface FriendRequestEntry {
  fid: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface FriendListResponse {
  friends: FriendOverviewEntry[];
  outgoingRequests: FriendRequestEntry[];
  incomingRequests: FriendRequestEntry[];
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
        streakCount: number;
        createdAt: Date;
      }>>()
    : [];

  const requestFids = Array.from(
    new Set([
      ...outgoing.map((req) => req.targetFid),
      ...incoming.map((req) => req.requesterFid),
    ]),
  );
  const requestDocs = requestFids.length
    ? await UserModel.find({ fid: { $in: requestFids } }).lean<Array<{
        fid: string;
        displayName?: string;
        avatarUrl?: string;
      }>>()
    : [];

  const requestDetails = new Map(requestDocs.map((doc) => [doc.fid, doc]));

  return {
    friends:
      friendDocs?.map((friend) => ({
        fid: friend.fid,
        displayName: friend.displayName,
        avatarUrl: friend.avatarUrl,
        streakCount: friend.streakCount,
        createdAt: friend.createdAt,
      })) ?? [],
    outgoingRequests: outgoing.map((req) => {
      const detail = requestDetails.get(req.targetFid);
      return {
        fid: req.targetFid,
        createdAt: req.createdAt,
        displayName: detail?.displayName,
        avatarUrl: detail?.avatarUrl,
      };
    }),
    incomingRequests: incoming.map((req) => {
      const detail = requestDetails.get(req.requesterFid);
      return {
        fid: req.requesterFid,
        createdAt: req.createdAt,
        displayName: detail?.displayName,
        avatarUrl: detail?.avatarUrl,
      };
    }),
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
