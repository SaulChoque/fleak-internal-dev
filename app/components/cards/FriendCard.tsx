"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Friend } from "@/app/types/friend";

interface FriendCardProps {
  friend: Friend;
}

const DETAIL_ITEMS: Array<{ icon: string; label: string; accessor: (friend: Friend) => string }> = [
  { icon: "calendar_month", label: "Date of invitation", accessor: (friend) => friend.invitedAt },
  { icon: "hub", label: "Chain", accessor: (friend) => friend.chain },
  { icon: "payments", label: "Total transacted", accessor: (friend) => friend.totalTransacted },
  { icon: "star", label: "General score", accessor: (friend) => friend.generalScore },
  { icon: "location_on", label: "Location", accessor: (friend) => friend.location },
];

export function FriendCard({ friend }: FriendCardProps) {
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
          py: 1.5,
          bgcolor: "#f9f9f9",
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            gap: 1.5,
          },
        }}
      >
        <Chip
          icon={<span className="material-symbols-rounded">check_circle</span>}
          label="Verified"
          color="default"
          sx={{
            fontWeight: 600,
            bgcolor: "#ffffff",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.12)",
            "& .MuiChip-label": { px: 1 },
          }}
        />
        <Stack spacing={0.25} flexGrow={1} minWidth={0}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {friend.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {friend.username}
          </Typography>
        </Stack>
        <Avatar
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
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.25, pb: 2.5, pt: 1.5 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Mutual testimonies
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {friend.mutualTestimonies}
            </Typography>
          </Stack>
          <Divider sx={{ borderStyle: "dashed" }} />
          <Stack spacing={1.2}>
            {DETAIL_ITEMS.map((detail) => (
              <Stack key={detail.label} direction="row" alignItems="center" spacing={1.5}>
                <span className="material-symbols-rounded" style={{ color: "#111111" }}>
                  {detail.icon}
                </span>
                <Stack spacing={0.25} flexGrow={1} minWidth={0}>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1.1}>
                    {detail.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {detail.accessor(friend)}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
