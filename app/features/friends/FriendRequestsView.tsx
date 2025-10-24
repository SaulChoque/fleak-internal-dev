"use client";

import { useState } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { FriendRequest } from "@/app/types/friend";
import { FriendRequestCard } from "@/app/components/cards/FriendRequestCard";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";

interface FriendRequestsViewProps {
  requests: FriendRequest[];
  onClose: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

type PendingAction = {
  id: string;
  kind: "accept" | "reject";
};

export function FriendRequestsView({ requests, onClose, onAccept, onReject }: FriendRequestsViewProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const handleAcceptIntent = (id: string) => {
    setPendingAction({ id, kind: "accept" });
  };

  const handleRejectIntent = (id: string) => {
    setPendingAction({ id, kind: "reject" });
  };

  const handleConfirm = () => {
    if (!pendingAction) return;
    if (pendingAction.kind === "accept") {
      onAccept(pendingAction.id);
    } else {
      onReject(pendingAction.id);
    }
    setPendingAction(null);
  };

  const handleDismiss = () => {
    setPendingAction(null);
  };

  const emptyState = requests.length === 0;

  const modalTitle = pendingAction
    ? pendingAction.kind === "accept"
      ? "Accept friend request?"
      : "Dismiss friend request?"
    : "";

  const modalDescription = pendingAction
    ? pendingAction.kind === "accept"
      ? "This person will be added to your friends list."
      : "They will remain pending until you decide later."
    : "";

  const modalConfirmLabel = pendingAction?.kind === "accept" ? "Accept" : "Keep pending";

  return (
    <Stack sx={{ minHeight: "100dvh", bgcolor: "background.default" }}>
      <Stack direction="row" alignItems="center" spacing={1.5} px={3} py={2}>
        <IconButton onClick={onClose} edge="start">
          <span className="material-symbols-rounded">arrow_back</span>
        </IconButton>
        <Stack spacing={0.25}>
          <Typography variant="h6" fontWeight={700}>
            Pending requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Decide who joins your accountability circle.
          </Typography>
        </Stack>
      </Stack>

      <Stack spacing={2.5} px={3} pb={3} flexGrow={1} overflow="auto">
        {emptyState ? (
          <Box
            sx={{
              borderRadius: 3,
              bgcolor: "rgba(17,17,17,0.04)",
              px: 3,
              py: 6,
              textAlign: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              No pending requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You&apos;re ready to add new friends when requests arrive.
            </Typography>
          </Box>
        ) : (
          requests.map((request) => (
            <FriendRequestCard
              key={request.id}
              request={request}
              onAccept={handleAcceptIntent}
              onReject={handleRejectIntent}
            />
          ))
        )}
      </Stack>

      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        title={modalTitle}
        description={modalDescription}
        confirmLabel={modalConfirmLabel}
        onCancel={handleDismiss}
        onConfirm={handleConfirm}
      />
    </Stack>
  );
}
