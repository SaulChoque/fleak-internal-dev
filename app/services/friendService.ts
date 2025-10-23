import { friendRequestsMock, friendSuggestionsMock, friendsMock } from "@/app/mocks/friends";
import { Friend, FriendRequest } from "@/app/types/friend";

export const FriendService = {
  async listFriends(): Promise<Friend[]> {
    return friendsMock;
  },
  async listRequests(): Promise<FriendRequest[]> {
    return friendRequestsMock;
  },
  async listSuggestions(): Promise<Friend[]> {
    return friendSuggestionsMock;
  },
};
