import { FinanceActivity, FinanceBalance } from "@/app/types/finance";
import { FinanceService } from "@/app/services/financeService";

export const FinanceController = {
  async getBalance(): Promise<FinanceBalance> {
    return FinanceService.getBalance();
  },
  async getActivity(): Promise<FinanceActivity[]> {
    return FinanceService.listActivity();
  },
};
