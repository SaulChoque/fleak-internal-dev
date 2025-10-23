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
import { TestimonyContactOption } from "@/app/types/testimony";

interface ContactActionsModalProps {
  isOpen: boolean;
  options: TestimonyContactOption[];
  title: string;
  onSelect: (option: TestimonyContactOption) => void;
  onClose: () => void;
}

export function ContactActionsModal({
  isOpen,
  options,
  title,
  onSelect,
  onClose,
}: ContactActionsModalProps) {
  const getIcon = (type: TestimonyContactOption["type"]) => {
    if (type === "call") return "call";
    if (type === "video") return "videocam";
    return "chat";
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          {options.map((option) => (
            <Button
              key={option.id}
              variant="outlined"
              onClick={() => onSelect(option)}
              sx={{
                textTransform: "none",
                justifyContent: "flex-start",
                borderRadius: 2,
                gap: 1.5,
              }}
            >
              <span className="material-symbols-rounded">{getIcon(option.type)}</span>
              {option.label}
            </Button>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
