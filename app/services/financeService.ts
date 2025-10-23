import { financeActivitiesMock, financeBalanceMock } from "@/app/mocks/finance";
import { FinanceActivity, FinanceBalance } from "@/app/types/finance";

export const FinanceService = {
  async getBalance(): Promise<FinanceBalance> {
    return financeBalanceMock;
  },
  async listActivity(): Promise<FinanceActivity[]> {
    return financeActivitiesMock;
  },
};
