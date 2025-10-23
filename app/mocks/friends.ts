import { Friend, FriendRequest } from "@/app/types/friend";

export const friendsMock: Friend[] = [
  {
    id: "friend-1",
    displayName: "Barco basurero",
    username: "@barco",
    avatarSeed: "barco",
    status: "active",
    lastSeen: "Online",
    mutualTestimonies: 12,
  },
  {
    id: "friend-2",
    displayName: "Noemiies",
    username: "@noemi",
    avatarSeed: "noemi",
    status: "active",
    lastSeen: "3 hrs",
    mutualTestimonies: 9,
  },
  {
    id: "friend-3",
    displayName: "Yobel",
    username: "@yobel",
    avatarSeed: "yobel",
    status: "active",
    lastSeen: "Online",
    mutualTestimonies: 5,
  },
  {
    id: "friend-4",
    displayName: "Skyblue rc",
    username: "@sky",
    avatarSeed: "sky",
    status: "active",
    lastSeen: "1 hr",
    mutualTestimonies: 7,
  },
];

export const friendRequestsMock: FriendRequest[] = [
  {
    id: "request-1",
    displayName: "Barco basurero",
    username: "@barco",
    reason: "Pending testimonies",
    sentAt: "7:41",
  },
  {
    id: "request-2",
    displayName: "Noemiies",
    username: "@noemi",
    reason: "Recent activity",
    sentAt: "3 hrs",
  },
];

export const friendSuggestionsMock: Friend[] = [
  {
    id: "suggestion-1",
    displayName: "garyglatam",
    username: "@gary",
    avatarSeed: "gary",
    status: "pending",
    lastSeen: "New",
    mutualTestimonies: 2,
  },
  {
    id: "suggestion-2",
    displayName: "L",
    username: "@elly",
    avatarSeed: "elly",
    status: "pending",
    lastSeen: "1d",
    mutualTestimonies: 1,
  },
  {
    id: "suggestion-3",
    displayName: "blankies",
    username: "@blank",
    avatarSeed: "blank",
    status: "pending",
    lastSeen: "3d",
    mutualTestimonies: 0,
  },
];
