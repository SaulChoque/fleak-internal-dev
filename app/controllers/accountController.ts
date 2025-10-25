import { AccountAction, AccountInfo } from "@/app/types/account";
import { AccountService } from "@/app/services/accountService";

export const AccountController = {
  async getAccount(): Promise<AccountInfo> {
    return AccountService.getInfo();
  },
  async getActions(): Promise<AccountAction[]> {
    return AccountService.listActions();
  },
  async logout(): Promise<void> {
    await AccountService.logout();
  },
};
