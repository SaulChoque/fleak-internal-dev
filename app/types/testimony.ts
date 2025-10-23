export type TestimonyStatus = "pending" | "review" | "completed" | "archived";

export interface TestimonyContactOption {
  id: string;
  type: "call" | "video" | "chat";
  label: string;
}

export interface TestimonyTimelineEntry {
  id: string;
  label: string;
  description: string;
  time: string;
}

export interface Testimony {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  status: TestimonyStatus;
  dueDate: string;
  dueTime: string;
  requester: string;
  category: string;
  referenceCode?: string;
  lastUpdate: string;
  timeline: TestimonyTimelineEntry[];
  contactOptions: TestimonyContactOption[];
}
