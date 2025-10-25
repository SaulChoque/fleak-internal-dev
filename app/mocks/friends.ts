import { Friend, FriendRequest } from "@/app/types/friend";

export const friendsMock: Friend[] = [
  {
    id: "friend-1",
    displayName: "Barco basurero",
    username: "@intensorigby",
  },
  {
    id: "friend-2",
    displayName: "Noemiles",
    username: "@neil_chan",
  },
  {
    id: "friend-3",
    displayName: "yobel",
    username: "@warner_wu",
  },
  {
    id: "friend-4",
    displayName: "skyblue rc",
    username: "@sky_blue",
  },
];

export const friendRequestsMock: FriendRequest[] = [
  {
    id: "request-1",
    displayName: "Barco basurero",
    username: "@barco",
    message: "Pending testimonies",
    sentAt: "7:41",
  },
  {
    id: "request-2",
    displayName: "Noemiies",
    username: "@noemi",
    message: "Recent activity",
    sentAt: "3 hrs",
  },
];

export const friendSuggestionsMock: Friend[] = [
  {
    id: "suggestion-1",
    displayName: "gerylatam",
    username: "@gery_gerkei",
  },
  {
    id: "suggestion-2",
    displayName: "L",
    username: "@el_patron",
  },
  {
    id: "suggestion-3",
    displayName: "blanks",
    username: "@h_perez",
  },
];
