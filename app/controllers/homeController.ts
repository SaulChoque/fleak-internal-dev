import { HomeActivity } from "@/app/types/home";
import { HomeService } from "@/app/services/homeService";

export const HomeController = {
  async getActivities(): Promise<HomeActivity[]> {
    return HomeService.listActivities();
  },
};
