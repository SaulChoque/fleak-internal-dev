export interface FinanceBalance {
  currency: string;
  amount: number;
  formatted: string;
}

export interface FinanceActivity {
  id: string;
  title: string;
  timestamp: string;
  type: "credit" | "debit";
  amount: string;
}
