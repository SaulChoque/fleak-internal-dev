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
  // additional optional fields for UI controls
  // type can be 'alarm' | 'timer' | 'custom' (controls conditional fields)
  type?: "alarm" | "timer" | "custom";
  // when type === 'alarm'
  alarmTime?: string; // ISO time string
  // when type === 'timer'
  timerMax?: string; // ISO time or duration-like string
  // when type === 'custom'
  description?: string;
  captureInitialPhoto?: boolean;
  // testimony type for custom activities: 'friends' | 'AI'
  testimonyType?: "friends" | "AI";
}
