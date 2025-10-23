import { testimoniesMock } from "@/app/mocks/testimonies";
import { Testimony } from "@/app/types/testimony";

export const TestimonyService = {
  async list(): Promise<Testimony[]> {
    return testimoniesMock;
  },
  async getById(id: string): Promise<Testimony | undefined> {
    return testimoniesMock.find((item) => item.id === id);
  },
};
