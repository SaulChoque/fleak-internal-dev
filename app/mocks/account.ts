import { AccountAction, AccountInfo } from "@/app/types/account";

export const accountInfoMock: AccountInfo = {
  id: "baluchop",
  displayName: "Baluchop",
  username: "@baluchop",
  email: "baluchop@fleak.app",
  location: "Arequipa, Peru",
  createdAt: "Joined 15/09",
  phone: "+51 999 999 999",
  favoriteFriends: ["@barco", "@noemi", "@yobel"],
  recentTestimonies: 4,
};

export const accountActionsMock: AccountAction[] = [
  { id: "share-chat", label: "Share via chat", icon: "chat" },
  { id: "share-whatsapp", label: "Share via Whatsapp", icon: "chat" },
  { id: "share-facebook", label: "Share via Facebook", icon: "share" },
  { id: "logout", label: "Log out", icon: "logout" },
  { id: "delete-account", label: "Delete account", icon: "delete", variant: "danger" },
];
