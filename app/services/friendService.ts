import { Friend, FriendRequest } from "@/app/types/friend";

type FriendOverviewResponse = {
  friends: Array<{
    fid: string;
    displayName?: string;
    avatarUrl?: string;
    streakCount?: number;
    createdAt?: string;
  }>;
  incomingRequests: Array<{
    fid: string;
    displayName?: string;
    avatarUrl?: string;
    createdAt: string;
  }>;
  outgoingRequests: Array<{
    fid: string;
    displayName?: string;
    avatarUrl?: string;
    createdAt: string;
  }>;
};

const FRIEND_USERNAME_PREFIX = "@";
async function fetchOverview(): Promise<FriendOverviewResponse> {
  const response = await fetch('/api/friends/overview', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('No autenticado. Por favor, inicia sesión.');
    }
    throw new Error(`Error del servidor: ${response.status}`);
  }

  return response.json();
}

const mapFriend = (item: FriendOverviewResponse['friends'][number]): Friend => ({
  id: item.fid,
  displayName: item.displayName ?? `FID ${item.fid}`,
  username: `${FRIEND_USERNAME_PREFIX}${item.fid}`,
  avatarUrl: item.avatarUrl,
  streakCount: item.streakCount,
  createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
});

const mapRequest = (item: FriendOverviewResponse['incomingRequests'][number]): FriendRequest => ({
  id: `incoming-${item.fid}-${item.createdAt}`,
  displayName: item.displayName ?? `FID ${item.fid}`,
  username: `${FRIEND_USERNAME_PREFIX}${item.fid}`,
  avatarUrl: item.avatarUrl,
  sentAt: new Date(item.createdAt).toISOString(),
  message: `${item.displayName ?? `@${item.fid}`} quiere unirse a tu círculo en Fleak.`,
});

export const FriendService = {
  async listFriends(): Promise<Friend[]> {
    try {
      const overview = await fetchOverview();
      return overview.friends.map(mapFriend);
    } catch (error) {
      console.error('FriendService.listFriends error:', error);
      throw error;
    }
  },

  async listRequests(): Promise<FriendRequest[]> {
    try {
      const overview = await fetchOverview();
      return overview.incomingRequests.map(mapRequest);
    } catch (error) {
      console.error('FriendService.listRequests error:', error);
      throw error;
    }
  },

  async listSuggestions(): Promise<Friend[]> {
    try {
      const overview = await fetchOverview();
      return overview.outgoingRequests.map(mapFriend);
    } catch (error) {
      console.error('FriendService.listSuggestions error:', error);
      throw error;
    }
  },
};
