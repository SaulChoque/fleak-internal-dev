"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TestimonyController } from "@/app/controllers/testimonyController";
import {
  TestimoniesDataset,
  Testimony,
  TestimonyHighlightCard,
  TestimonyVoteOption,
} from "@/app/types/testimony";
import { TestimonyCard } from "@/app/components/cards/TestimonyCard";
import { VoteModal } from "@/app/components/modals/VoteModal";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";

type TestimonyScreen = "overview" | "manage";

interface ConfirmContext {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}

interface VoteContext {
  testimony: Testimony;
  options: TestimonyVoteOption[];
}

export function TestimoniesView() {
  const [dataset, setDataset] = useState<TestimoniesDataset | null>(null);
  const [screen, setScreen] = useState<TestimonyScreen>("overview");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [confirmContext, setConfirmContext] = useState<ConfirmContext | null>(null);
  const [voteContext, setVoteContext] = useState<VoteContext | null>(null);
  const [pendingVoteOption, setPendingVoteOption] = useState<TestimonyVoteOption | null>(null);

  useEffect(() => {
    TestimonyController.getDataset().then((data) => {
      setDataset(data);
    });
  }, []);

  const toggleCard = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openVoteModal = (testimony: Testimony) => {
    if (!testimony.voteOptions?.length) return;
    setVoteContext({ testimony, options: testimony.voteOptions });
  };

  const handleAction = (testimony: Testimony, actionId: string) => {
    if (actionId === "vote") {
      openVoteModal(testimony);
      return;
    }

    if (actionId === "confirmJudge") {
      setConfirmContext({
        message: "Do you wanna be the judge?",
        onConfirm: () => {
          setConfirmContext(null);
        },
      });
    }
  };

  const handleVoteSelection = (option: TestimonyVoteOption) => {
    setPendingVoteOption(option);
    setConfirmContext({
      message: "Are you sure of the selection?",
      onConfirm: () => {
        setConfirmContext(null);
        setVoteContext(null);
        setPendingVoteOption(null);
      },
    });
  };

  const dismissConfirm = () => {
    setConfirmContext(null);
    setPendingVoteOption(null);
  };

  const highlightCard: TestimonyHighlightCard | undefined = useMemo(() => {
    if (!dataset) return undefined;
    const hasPending = dataset.pendingReview.length > 0 || dataset.invitations.length > 0;
    if (!hasPending) return undefined;
    return dataset.highlightCard;
  }, [dataset]);

  if (!dataset) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 320 }}>
        <Typography variant="body1" color="text.secondary">
          Loading testimonies…
        </Typography>
      </Stack>
    );
  }

  const renderSection = (title: string, items: Testimony[]) => (
    <Stack spacing={2.5}>
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
      {items.length ? (
        <Stack spacing={2}>
          {items.map((testimony) => (
            <TestimonyCard
              key={testimony.id}
              testimony={testimony}
              isExpanded={expandedIds.has(testimony.id)}
              onToggle={toggleCard}
              onAction={handleAction}
            />
          ))}
        </Stack>
      ) : (
        <Paper elevation={0} sx={{ py: 4, borderRadius: 3, textAlign: "center", bgcolor: (theme) => theme.palette.action.hover }}>
          <Typography variant="body2" color="text.secondary">
            Nothing to show right now.
          </Typography>
        </Paper>
      )}
    </Stack>
  );

  return (
    <Stack spacing={3.5} sx={{ width: "100%", maxWidth: 760, mx: "auto", py: 2 }}>
      {screen === "overview" ? (
        <Stack spacing={3.5}>
          <TextField variant="outlined" placeholder="Search for anyone" fullWidth InputProps={{ sx: { borderRadius: 999 } }} />
          {highlightCard ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setScreen("manage")}
              sx={{
                borderRadius: 3,
                justifyContent: "space-between",
                alignItems: "center",
                textTransform: "none",
                py: 2,
                px: 3,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <span className="material-symbols-rounded">{highlightCard.icon}</span>
                <Box textAlign="left">
                  <Typography variant="subtitle1" fontWeight={700}>
                    {highlightCard.title}
                  </Typography>
                  <Typography variant="body2">{highlightCard.description}</Typography>
                </Box>
              </Stack>
              <span className="material-symbols-rounded">chevron_right</span>
            </Button>
          ) : null}
          {renderSection("Recent activity", dataset.recentActivity)}
        </Stack>
      ) : (
        <Stack spacing={3.5}>
          <Button
            variant="text"
            onClick={() => setScreen("overview")}
            sx={{ alignSelf: "flex-start", textTransform: "none", gap: 1 }}
          >
            <span className="material-symbols-rounded">arrow_back</span>
            Back
          </Button>
          {renderSection("Pending of revision", dataset.pendingReview)}
          {renderSection("Invitations", dataset.invitations)}
        </Stack>
      )}

      <VoteModal
        isOpen={Boolean(voteContext)}
        title="Who won"
        options={voteContext?.options ?? []}
        onSelect={handleVoteSelection}
        onClose={() => {
          setVoteContext(null);
          setPendingVoteOption(null);
        }}
      />
      <ConfirmModal
        isOpen={Boolean(confirmContext)}
        title={confirmContext?.message ?? ""}
        description={pendingVoteOption ? pendingVoteOption.label : undefined}
        confirmLabel={confirmContext?.confirmLabel}
        cancelLabel={confirmContext?.cancelLabel}
        onConfirm={() => {
          confirmContext?.onConfirm();
        }}
        onCancel={dismissConfirm}
      />
    </Stack>
  );
}
