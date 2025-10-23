import { accountActionsMock, accountInfoMock } from "@/app/mocks/account";
import { AccountAction, AccountInfo } from "@/app/types/account";

export const AccountService = {
  async getInfo(): Promise<AccountInfo> {
    return accountInfoMock;
  },
  async listActions(): Promise<AccountAction[]> {
    return accountActionsMock;
  },
};
