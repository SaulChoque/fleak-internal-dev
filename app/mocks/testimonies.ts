import { TestimoniesDataset } from "@/app/types/testimony";

export const testimoniesDataset: TestimoniesDataset = {
  highlightCard: {
    id: "pending-summary",
    icon: "notifications_active",
    title: "Pending testimonies",
    description: "You have 9 pending testimonies",
  },
  pendingReview: [
    {
      id: "pending-read-homework",
      category: "pendingReview",
      statusLabel: "Pending of revision",
      title: "Read the homework",
      amount: "5 USDC",
      scheduleLabel: "15:41",
      details: [
        {
          id: "pending-read-homework-start-date",
          icon: "event",
          label: "Date of beginning",
          value: "15/06",
        },
        {
          id: "pending-read-homework-total",
          icon: "payments",
          label: "Total in game",
          value: "5 USDC",
        },
        {
          id: "pending-read-homework-people",
          icon: "group",
          label: "People involved",
          value: "2 (Noemiel, mario)",
        },
        {
          id: "pending-read-homework-location",
          icon: "location_on",
          label: "Location",
          value: "CDMX, Asuncion",
        },
        {
          id: "pending-read-homework-vote",
          icon: "how_to_vote",
          label: "Vote",
          actionId: "vote",
          actionLabel: "Vote",
        },
      ],
      voteOptions: [
        { id: "vote-noemiel", icon: "face_3", label: "Noemiel" },
        { id: "vote-mario", icon: "face_6", label: "mario" },
        { id: "vote-none", icon: "close", label: "none" },
      ],
    },
    {
      id: "pending-do-dishes",
      category: "pendingReview",
      statusLabel: "Pending of revision",
      title: "Do the dishes at home",
      amount: "2 USDC",
      scheduleLabel: "17:41",
      details: [
        {
          id: "pending-do-dishes-start-date",
          icon: "event",
          label: "Date of beginning",
          value: "15/06",
        },
        {
          id: "pending-do-dishes-total",
          icon: "payments",
          label: "Total in game",
          value: "2 USDC",
        },
        {
          id: "pending-do-dishes-people",
          icon: "group",
          label: "People involved",
          value: "2 (Noemiel, mario)",
        },
        {
          id: "pending-do-dishes-location",
          icon: "location_on",
          label: "Location",
          value: "CDMX, Asuncion",
        },
        {
          id: "pending-do-dishes-vote",
          icon: "how_to_vote",
          label: "Vote",
          actionId: "vote",
          actionLabel: "Vote",
        },
      ],
      voteOptions: [
        { id: "vote-noemiel-dishes", icon: "face_3", label: "Noemiel" },
        { id: "vote-mario-dishes", icon: "face_6", label: "mario" },
        { id: "vote-none-dishes", icon: "close", label: "none" },
      ],
    },
  ],
  invitations: [
    {
      id: "invitation-malori-yobel",
      category: "invitation",
      statusLabel: "Invitations",
      title: "Malori vs yobel",
      amount: "10 USDC",
      scheduleLabel: "15/09",
      details: [
        {
          id: "invitation-malori-yobel-start-date",
          icon: "event",
          label: "Date of beginning",
          value: "15/09",
        },
        {
          id: "invitation-malori-yobel-total",
          icon: "payments",
          label: "Total in game",
          value: "25 USDC",
        },
        {
          id: "invitation-malori-yobel-people",
          icon: "group",
          label: "People involved",
          value: "2 (Malori, yobel)",
        },
        {
          id: "invitation-malori-yobel-location",
          icon: "location_on",
          label: "Location",
          value: "CDMX, CDMX",
        },
        {
          id: "invitation-malori-yobel-confirm",
          icon: "gavel",
          label: "Confirm being the judge",
          actionId: "confirmJudge",
          actionLabel: "Confirm",
        },
      ],
    },
  ],
  recentActivity: [
    {
      id: "recent-workout",
      category: "recentActivity",
      statusLabel: "Recent activity",
      title: "Workout at the gym",
      amount: "5 USDC",
      scheduleLabel: "15:41",
      details: [
        {
          id: "recent-workout-winner",
          icon: "emoji_events",
          label: "Winner",
          value: "Noemiel",
        },
        {
          id: "recent-workout-start-date",
          icon: "event",
          label: "Date of beginning",
          value: "15/06",
        },
        {
          id: "recent-workout-total",
          icon: "payments",
          label: "Total in game",
          value: "5 USDC",
        },
        {
          id: "recent-workout-people",
          icon: "group",
          label: "People involved",
          value: "2 (Noemiel, mario)",
        },
        {
          id: "recent-workout-location",
          icon: "location_on",
          label: "Location",
          value: "CDMX, Asuncion",
        },
      ],
    },
    {
      id: "recent-dishes",
      category: "recentActivity",
      statusLabel: "Recent activity",
      title: "Do the dishes at home",
      amount: "2 USDC",
      scheduleLabel: "17:41",
      details: [
        {
          id: "recent-dishes-winner",
          icon: "emoji_events",
          label: "Winner",
          value: "Pending",
        },
        {
          id: "recent-dishes-start-date",
          icon: "event",
          label: "Date of beginning",
          value: "15/06",
        },
        {
          id: "recent-dishes-total",
          icon: "payments",
          label: "Total in game",
          value: "2 USDC",
        },
        {
          id: "recent-dishes-people",
          icon: "group",
          label: "People involved",
          value: "2 (Noemiel, mario)",
        },
        {
          id: "recent-dishes-location",
          icon: "location_on",
          label: "Location",
          value: "CDMX, Asuncion",
        },
      ],
    },
  ],
};
