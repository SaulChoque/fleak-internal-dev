import { FinanceActivity, FinanceBalance } from "@/app/types/finance";

export const financeBalanceMock: FinanceBalance = {
  currency: "USDC",
  amount: 15.03,
  formatted: "15.03 USDC",
  address: "0xas6d4a6s5",
};

export const financeActivitiesMock: FinanceActivity[] = [
  {
    id: "activity-1",
    title: "Base deposit",
    timestamp: "+20 USDC",
    type: "credit",
    amount: "+20 USDC",
  },
  {
    id: "activity-2",
    title: "Base withdraw",
    timestamp: "-5 USDC",
    type: "debit",
    amount: "-5 USDC",
  },
  {
    id: "activity-3",
    title: "Finish the test first",
    timestamp: "+5 USDC",
    type: "credit",
    amount: "+5 USDC",
  },
  {
    id: "activity-4",
    title: "Missed alarm",
    timestamp: "-2 USDC",
    type: "debit",
    amount: "-2 USDC",
  },
];
