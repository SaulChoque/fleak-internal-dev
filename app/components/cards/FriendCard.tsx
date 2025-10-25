"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Friend } from "@/app/types/friend";

interface FriendCardProps {
  friend: Friend;
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const buildDetailItems = (friend: Friend) => {
  const details: Array<{ icon: string; label: string; value: string }> = [
    { icon: "fingerprint", label: "FID", value: `FID ${friend.id}` },
  ];

  if (friend.createdAt) {
    details.push({
      icon: "event_available",
      label: "Friend since",
      value: dateFormatter.format(new Date(friend.createdAt)),
    });
  }

  if (typeof friend.streakCount === "number") {
    details.push({
      icon: "local_fire_department",
      label: "Streak",
      value: `${friend.streakCount} días`,
    });
  }

  return details;
};

export function FriendCard({ friend }: FriendCardProps) {
  const detailItems = buildDetailItems(friend);

  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      defaultExpanded
      sx={{
        borderRadius: 1.5,
        bgcolor: "background.paper",
        boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.12)",
        overflow: "hidden",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<span className="material-symbols-rounded">expand_more</span>}
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: "#f9f9f9",
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            gap: 1.5,
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0} flexGrow={1}>
          <Avatar
            src={friend.avatarUrl}
            alt={`${friend.displayName} avatar`}
            sx={{
              width: 48,
              height: 48,
              bgcolor: "#111111",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            {friend.displayName.charAt(0)}
          </Avatar>
          <Stack spacing={0.25} minWidth={0}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {friend.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {friend.username}
            </Typography>
          </Stack>
        </Stack>
        <Chip
          icon={<span className="material-symbols-rounded">handshake</span>}
          label="Active friend"
          color="default"
          sx={{
            fontWeight: 600,
            bgcolor: "#ffffff",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.12)",
            "& .MuiChip-label": { px: 1 },
          }}
        />
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.25, pb: 2.5, pt: 1.5 }}>
        <Stack spacing={1.2}>
          {detailItems.map((detail) => (
            <Stack key={detail.label} direction="row" alignItems="center" spacing={1.5}>
              <span className="material-symbols-rounded" style={{ color: "#111111" }}>
                {detail.icon}
              </span>
              <Stack spacing={0.25} flexGrow={1} minWidth={0}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1.1}>
                  {detail.label}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {detail.value}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
