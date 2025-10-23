export interface AccountAction {
  id: string;
  label: string;
  icon: "phone" | "chat" | "video" | "share" | "logout" | "delete";
  variant?: "danger";
}

export interface AccountInfo {
  id: string;
  displayName: string;
  username: string;
  dateOfInvitation: string;
  chain: string;
  totalTransacted: string;
  generalScore: string;
  location: string;
  numberOfFriends: number;
  goalsAchieved: number;
  favoriteFriend: string;
  streak: string;
}
