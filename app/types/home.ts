export type ActivityAmountKind = "credit" | "debit" | "neutral";

export interface DaySelection {
  id: string;
  label: string;
  isActive: boolean;
}

export interface HomeActivity {
  id: string;
  title: string;
  icon: string;
  summaryTimeLabel: string;
  amountType: ActivityAmountKind;
  amountValue: number;
  amountUnit: string;
  repeatLabel: string;
  isActive: boolean;
  days: DaySelection[];
  typeLabel: string;
  start: string;
  end: string;
  notificationsEnabled: boolean;
  testifiers: string[];
}
