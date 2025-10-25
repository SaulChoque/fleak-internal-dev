"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { FriendRequest } from "@/app/types/friend";

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

const requestDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const getRequestMessage = (request: FriendRequest) =>
  request.message ?? "Quiere conectar contigo en Fleak.";

export function FriendRequestCard({ request, onAccept, onReject }: FriendRequestCardProps) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      sx={{
        borderRadius: 1.5,
        bgcolor: "background.paper",
        boxShadow: "0px 14px 36px rgba(15, 23, 42, 0.12)",
        overflow: "hidden",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        "&:before": { display: "none" },
        "& .MuiAccordionSummary-root": {
          borderRadius: 0,
        },
        "& .MuiAccordionDetails-root": {
          borderRadius: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<span className="material-symbols-rounded">expand_more</span>}
        sx={{
          px: 2,
          py: 1.75,
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
          <Avatar
            src={request.avatarUrl}
            alt={`${request.displayName} avatar`}
            sx={{
              bgcolor: "primary.main",
              color: "common.white",
              fontWeight: 700,
            }}
          >
            {request.displayName.charAt(0)}
          </Avatar>
          <Stack spacing={0.25} minWidth={0}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {request.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {request.username}
            </Typography>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {requestDateFormatter.format(new Date(request.sentAt))}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <Stack spacing={1.75}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <span className="material-symbols-rounded" style={{ color: "#1e88e5" }}>
              chat
            </span>
            <Typography variant="body2" color="text.secondary">
              {getRequestMessage(request)}
            </Typography>
          </Stack>
          <Divider flexItem sx={{ borderStyle: "dashed" }} />
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onReject?.(request.id);
              }}
              sx={{ textTransform: "none", borderRadius: 999 }}
            >
              Later
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onAccept?.(request.id);
              }}
              sx={{ textTransform: "none", borderRadius: 999 }}
            >
              Accept
            </Button>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
