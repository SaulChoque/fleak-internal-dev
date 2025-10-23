import { Friend, FriendRequest } from "@/app/types/friend";
import { FriendService } from "@/app/services/friendService";

export const FriendController = {
  async getFriends(): Promise<Friend[]> {
    return FriendService.listFriends();
  },
  async getRequests(): Promise<FriendRequest[]> {
    return FriendService.listRequests();
  },
  async getSuggestions(): Promise<Friend[]> {
    return FriendService.listSuggestions();
  },
};
