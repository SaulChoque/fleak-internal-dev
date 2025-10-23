"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmColor = tone === "danger" ? "error" : "primary";

  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>
      {description ? (
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </DialogContent>
      ) : null}
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Stack direction="row" spacing={1} width="100%" justifyContent="flex-end">
          <Button onClick={onCancel} sx={{ textTransform: "none" }}>
            {cancelLabel}
          </Button>
          <Button
            variant="contained"
            color={confirmColor}
            onClick={onConfirm}
            sx={{ textTransform: "none" }}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
