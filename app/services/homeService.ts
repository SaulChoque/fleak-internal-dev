import { homeActivitiesMock } from "@/app/mocks/home";
import { HomeActivity } from "@/app/types/home";

export const HomeService = {
  async listActivities(): Promise<HomeActivity[]> {
    return homeActivitiesMock;
  },
};
