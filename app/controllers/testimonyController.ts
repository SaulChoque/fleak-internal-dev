import { TestimoniesDataset, Testimony } from "@/app/types/testimony";
import { TestimonyService } from "@/app/services/testimonyService";

export const TestimonyController = {
  async getDataset(): Promise<TestimoniesDataset> {
    const dataset = await TestimonyService.getDataset();
    return {
      ...dataset,
      pendingReview: [...dataset.pendingReview],
      invitations: [...dataset.invitations],
      recentActivity: [...dataset.recentActivity],
    };
  },
  async getTestimonyDetail(id: string): Promise<Testimony | undefined> {
    return TestimonyService.getById(id);
  },
};
