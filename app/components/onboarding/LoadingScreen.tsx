"use client";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";

interface LoadingScreenProps {
  open: boolean;
  message?: string;
}

export function LoadingScreen({ open, message = "Preparing your Fleak experience..." }: LoadingScreenProps) {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 200,
        bgcolor: "rgba(0, 0, 0, 0.88)",
        color: "common.white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          px: 2,
        }}
      >
        <CircularProgress color="inherit" thickness={4} size={56} />
        <Typography variant="h6" fontWeight={700} textAlign="center">
          {message}
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          sx={{ color: "rgba(255, 255, 255, 0.72)", maxWidth: 260 }}
        >
          We are activating your flakes and syncing your on-chain state. Stay close, this only takes a moment.
        </Typography>
      </Box>
    </Backdrop>
  );
}
