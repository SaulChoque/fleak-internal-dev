"use client";

import { useEffect, useState } from "react";
import { Stack, Typography } from "@mui/material";
import { HomeActivity } from "@/app/types/home";
import { HomeController } from "@/app/controllers/homeController";
import { HomeActivityCard } from "@/app/components/cards/HomeActivityCard";

export function HomeView() {
  const [activities, setActivities] = useState<HomeActivity[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    HomeController.getActivities().then(setActivities);
  }, []);

  const handleToggle = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <Stack spacing={2.5} sx={{ width: "100%", maxWidth: 680, mx: "auto", py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
          history
        </span>
        <Typography variant="h6" fontWeight={700}>
          Recent activity
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {activities.map((activity) => (
          <HomeActivityCard
            key={activity.id}
            activity={activity}
            isExpanded={expandedId === activity.id}
            onToggle={handleToggle}
          />
        ))}
      </Stack>
    </Stack>
  );
}
