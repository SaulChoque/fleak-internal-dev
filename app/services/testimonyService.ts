import { testimoniesDataset } from "@/app/mocks/testimonies";
import { TestimoniesDataset, Testimony } from "@/app/types/testimony";

export const TestimonyService = {
  async getDataset(): Promise<TestimoniesDataset> {
    return testimoniesDataset;
  },
  async getById(id: string): Promise<Testimony | undefined> {
    const { pendingReview, invitations, recentActivity } = testimoniesDataset;
    return [...pendingReview, ...invitations, ...recentActivity].find((item) => item.id === id);
  },
};
