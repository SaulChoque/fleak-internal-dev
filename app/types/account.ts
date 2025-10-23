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
  email: string;
  location: string;
  createdAt: string;
  phone: string;
  favoriteFriends: string[];
  recentTestimonies: number;
}
