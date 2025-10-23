import { AccountAction, AccountInfo } from "@/app/types/account";

export const accountInfoMock: AccountInfo = {
  id: "baluchop",
  displayName: "Baluchop",
  username: "@baluchop",
  dateOfInvitation: "15/06",
  chain: "Base sepolia",
  totalTransacted: "+6/-5 USDC",
  generalScore: "5/3",
  location: "CDMX, 11:41",
  numberOfFriends: 15,
  goalsAchieved: 5,
  favoriteFriend: "Noemiel",
  streak: "16 days",
};

export const accountActionsMock: AccountAction[] = [
  { id: "delete-account", label: "Delete account", icon: "delete", variant: "danger" },
];
