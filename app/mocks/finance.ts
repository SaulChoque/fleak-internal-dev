import { FinanceActivity, FinanceBalance } from "@/app/types/finance";

export const financeBalanceMock: FinanceBalance = {
  currency: "USDC",
  amount: 15.03,
  formatted: "15.03 USDC",
};

export const financeActivitiesMock: FinanceActivity[] = [
  {
    id: "activity-1",
    title: "Missed alarm",
    timestamp: "07:41",
    type: "debit",
    amount: "-1.20",
  },
  {
    id: "activity-2",
    title: "Instagram",
    timestamp: "3 hrs",
    type: "debit",
    amount: "-0.30",
  },
  {
    id: "activity-3",
    title: "Finish the test",
    timestamp: "15:41",
    type: "credit",
    amount: "+2.00",
  },
];
