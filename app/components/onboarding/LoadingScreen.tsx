"use client";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";

interface LoadingScreenProps {
  open: boolean;
  message?: string;
}

export function LoadingScreen({ open, message = "Preparando tu experiencia en Fleak..." }: LoadingScreenProps) {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 200,
        bgcolor: "rgba(17, 17, 17, 0.92)",
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
          Activamos tus flakes y sincronizamos tu estado on-chain. Mantente cerca, esto toma solo un momento.
        </Typography>
      </Box>
    </Backdrop>
  );
}
