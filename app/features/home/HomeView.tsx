"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Dialog, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { HomeActivity } from "@/app/types/home";
import { HomeController } from "@/app/controllers/homeController";
import { HomeActivityCard, HomeActivityChange } from "@/app/components/cards/HomeActivityCard";
import { Friend } from "@/app/types/friend";
import { FriendSelectorView } from "@/app/features/friends/AddFriendView";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";

const baseDays = [
  { id: "mon", label: "M", isActive: true },
  { id: "tue", label: "T", isActive: true },
  { id: "wed", label: "W", isActive: true },
  { id: "thu", label: "T", isActive: true },
  { id: "fri", label: "F", isActive: true },
  { id: "sat", label: "S", isActive: false },
  { id: "sun", label: "S", isActive: false },
];

function cloneActivity(activity: HomeActivity): HomeActivity {
  return {
    ...activity,
    days: activity.days.map((day) => ({ ...day })),
    testifiers: [...activity.testifiers],
  };
}

function normalizeActivities(activities: HomeActivity[]): HomeActivity[] {
  return activities.map(cloneActivity);
}

function computeAmountKind(amount: number): HomeActivity["amountType"] {
  if (amount > 0) return "credit";
  if (amount < 0) return "debit";
  return "neutral";
}

function createDraftActivity(): HomeActivity {
  const start = dayjs();
  const end = start.add(1, "hour");
  return {
    id: `activity-draft-${Date.now()}`,
    title: "New activity",
    icon: "task_alt",
    summaryTimeLabel: start.format("HH:mm"),
    amountType: "neutral",
    amountValue: 0,
    amountUnit: "USDC",
    repeatLabel: "No repeat",
    isActive: true,
    days: baseDays.map((day) => ({ ...day })),
    typeLabel: "Reminder",
    start: start.toISOString(),
    end: end.toISOString(),
    notificationsEnabled: true,
    testifiers: [],
  };
}

export function HomeView() {
  const [activities, setActivities] = useState<HomeActivity[]>([]);
  const [newActivity, setNewActivity] = useState<HomeActivity | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectorActivityId, setSelectorActivityId] = useState<string | null>(null);
  const [isSelectorOpen, setSelectorOpen] = useState(false);
  const [pendingFriend, setPendingFriend] = useState<Friend | null>(null);

  const storedInitial = useRef<HomeActivity[]>([]);

  useEffect(() => {
    HomeController.getActivities().then((fetched) => {
      const normalized = normalizeActivities(fetched);
      storedInitial.current = normalized;
      setActivities(normalized);
    });
  }, []);

  const handleToggle = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const upsertActivity = (id: string, updater: (activity: HomeActivity) => HomeActivity) => {
    setActivities((current) =>
      current.map((activity) => (activity.id === id ? cloneActivity(updater(activity)) : activity)),
    );

    setNewActivity((current) => {
      if (!current || current.id !== id) return current;
      return cloneActivity(updater(current));
    });
  };

  const handleActivityChange = (id: string, changes: HomeActivityChange) => {
    upsertActivity(id, (activity) => {
      const next: HomeActivity = {
        ...activity,
        ...changes,
      };

      if (changes.days) {
        next.days = changes.days.map((day) => ({ ...day }));
      }

      if (typeof changes.amountValue === "number") {
        next.amountType = computeAmountKind(changes.amountValue);
      }

      if (changes.testifiers) {
        next.testifiers = [...changes.testifiers];
      }

      return next;
    });
  };

  const handleCancel = (id: string) => {
    if (newActivity && newActivity.id === id) {
      setNewActivity(null);
      setExpandedId(null);
      return;
    }

    const original = storedInitial.current.find((activity) => activity.id === id);
    if (original) {
      setActivities((current) =>
        current.map((activity) => (activity.id === id ? cloneActivity(original) : activity)),
      );
    }
    setExpandedId(null);
  };

  const handleSave = (id: string) => {
    if (newActivity && newActivity.id === id) {
      setActivities((current) => [cloneActivity(newActivity), ...current]);
      storedInitial.current = [cloneActivity(newActivity), ...storedInitial.current];
      setNewActivity(null);
    } else {
      const currentActivity = activities.find((activity) => activity.id === id);
      if (currentActivity) {
        storedInitial.current = storedInitial.current.map((activity) =>
          activity.id === id ? cloneActivity(currentActivity) : activity,
        );
      }
    }
    setExpandedId(null);
  };

  const handleNewActivity = () => {
    if (newActivity) {
      setExpandedId(newActivity.id);
      return;
    }
    const draft = createDraftActivity();
    setNewActivity(draft);
    setExpandedId(draft.id);
  };

  const handleManageTestifiers = (activityId: string) => {
    setSelectorActivityId(activityId);
    setSelectorOpen(true);
  };

  const handleSelectorClose = () => {
    setSelectorOpen(false);
    setSelectorActivityId(null);
    setPendingFriend(null);
  };

  const handleFriendPicked = (friend: Friend) => {
    setPendingFriend(friend);
  };

  const confirmAddFriend = () => {
    if (!selectorActivityId || !pendingFriend) return;

    const apply = (activity: HomeActivity) => {
      if (activity.testifiers.includes(pendingFriend.username)) {
        return activity;
      }
      return {
        ...activity,
        testifiers: [...activity.testifiers, pendingFriend.username],
      };
    };

    upsertActivity(selectorActivityId, apply);
    setPendingFriend(null);
  };

  const handleRemoveTestifier = (activityId: string, username: string) => {
    upsertActivity(activityId, (activity) => ({
      ...activity,
      testifiers: activity.testifiers.filter((testifier) => testifier !== username),
    }));
  };

  const renderedActivities = useMemo(() => {
    return newActivity ? [newActivity, ...activities] : activities;
  }, [activities, newActivity]);

  const selectorTitle = newActivity && selectorActivityId === newActivity.id ? "Assign testifiers" : "Add testifiers";
  const selectorDescription = "Choose someone you trust to keep you on track";

  const selectedActivity = selectorActivityId
    ? renderedActivities.find((activity) => activity.id === selectorActivityId)
    : null;

  return (
    <Stack spacing={2.5} sx={{ width: "100%", maxWidth: 680, mx: "auto", py: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1}>
          <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
            history
          </span>
          <Typography variant="h6" fontWeight={700}>
            Recent activity
          </Typography>
        </Stack>
        <Button
          variant="contained"
          size="small"
          onClick={handleNewActivity}
          sx={{ textTransform: "none", borderRadius: 999, gap: 1 }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
            add
          </span>
          New activity
        </Button>
      </Stack>
      <Stack spacing={2}>
        {renderedActivities.map((activity) => (
          <HomeActivityCard
            key={activity.id}
            activity={activity}
            isExpanded={expandedId === activity.id}
            isNew={newActivity?.id === activity.id}
            onToggle={handleToggle}
            onChange={handleActivityChange}
            onCancel={handleCancel}
            onSave={handleSave}
            onManageTestifiers={handleManageTestifiers}
            onRemoveTestifier={handleRemoveTestifier}
          />
        ))}
      </Stack>

      <Dialog fullScreen open={isSelectorOpen} onClose={handleSelectorClose}>
        {selectedActivity ? (
          <FriendSelectorView
            title={selectorTitle}
            description={selectorDescription}
            mode="friends"
            onClose={handleSelectorClose}
            onSelect={handleFriendPicked}
            selectedUsernames={selectedActivity.testifiers}
          />
        ) : null}
      </Dialog>

      <ConfirmModal
        isOpen={Boolean(pendingFriend)}
        title={pendingFriend ? `Add ${pendingFriend.displayName} as testifier?` : ""}
        description="They will help you stay accountable for this activity."
        confirmLabel="Add"
        onCancel={() => setPendingFriend(null)}
        onConfirm={confirmAddFriend}
      />
    </Stack>
  );
}
