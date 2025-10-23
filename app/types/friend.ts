export type FriendStatus = "active" | "pending" | "blocked";

export interface Friend {
  id: string;
  displayName: string;
  username: string;
  avatarSeed: string;
  status: FriendStatus;
  lastSeen: string;
  mutualTestimonies: number;
  invitedAt: string;
  chain: string;
  totalTransacted: string;
  generalScore: string;
  location: string;
}

export interface FriendRequest {
  id: string;
  displayName: string;
  username: string;
  reason: string;
  sentAt: string;
}
