import { Testimony } from "@/app/types/testimony";
import { TestimonyService } from "@/app/services/testimonyService";

export const TestimonyController = {
  async getTestimonies(): Promise<Testimony[]> {
    const testimonies = await TestimonyService.list();
    return testimonies.sort((a, b) => a.title.localeCompare(b.title));
  },
  async getTestimonyDetail(id: string): Promise<Testimony | undefined> {
    return TestimonyService.getById(id);
  },
};
