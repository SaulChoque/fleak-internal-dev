export interface HomeActivity {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  amountLabel: string;
  amountType: "credit" | "debit" | "neutral";
  icon: string;
  details: {
    repeatLabel: string;
    isActive: boolean;
    days: Array<{ label: string; isActive: boolean }>;
    typeLabel: string;
    startLabel: string;
    endLabel: string;
    amountLabel: string;
    notificationsEnabled: boolean;
    testifiers: string[];
  };
}
