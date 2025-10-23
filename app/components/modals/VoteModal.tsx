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
import { TestimonyVoteOption } from "@/app/types/testimony";

interface VoteModalProps {
  isOpen: boolean;
  title: string;
  options: TestimonyVoteOption[];
  onSelect: (option: TestimonyVoteOption) => void;
  onClose: () => void;
}

export function VoteModal({ isOpen, title, options, onSelect, onClose }: VoteModalProps) {
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
              variant="contained"
              color="secondary"
              onClick={() => onSelect(option)}
              sx={{
                textTransform: "none",
                justifyContent: "flex-start",
                borderRadius: 2,
                gap: 1.5,
              }}
            >
              <span className="material-symbols-rounded">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
