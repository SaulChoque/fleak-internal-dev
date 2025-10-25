export interface Friend {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  streakCount?: number;
  createdAt?: string;
}

export interface FriendRequest {
  id: string;
  displayName: string;
  username: string;
  sentAt: string;
  avatarUrl?: string;
  message?: string;
}
