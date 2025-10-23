export type TestimonyCategory = "pendingReview" | "invitation" | "recentActivity";

export interface TestimonyDetailItem {
  id: string;
  icon: string;
  label: string;
  value?: string;
  actionId?: string;
  actionLabel?: string;
}

export interface TestimonyVoteOption {
  id: string;
  label: string;
  icon: string;
}

export interface Testimony {
  id: string;
  category: TestimonyCategory;
  statusLabel: string;
  title: string;
  amount: string;
  scheduleLabel: string;
  subtitle?: string;
  details: TestimonyDetailItem[];
  voteOptions?: TestimonyVoteOption[];
}

export interface TestimonyHighlightCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface TestimoniesDataset {
  highlightCard?: TestimonyHighlightCard;
  pendingReview: Testimony[];
  invitations: Testimony[];
  recentActivity: Testimony[];
}
