"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { AccountAction, AccountInfo } from "@/app/types/account";

interface AccountInfoCardProps {
  info: AccountInfo;
  actions: AccountAction[];
  onAction: (action: AccountAction) => void;
}

export function AccountInfoCard({ info, actions, onAction }: AccountInfoCardProps) {
  const primaryDetails: DetailItem[] = [
    { icon: "fingerprint", label: "FID", value: info.id },
    { icon: "calendar_month", label: "Date of invitation", value: info.dateOfInvitation },
    { icon: "hub", label: "Chain", value: info.chain },
    { icon: "payments", label: "Total transacted", value: info.totalTransacted },
    { icon: "star", label: "General score", value: info.generalScore },
    { icon: "location_on", label: "Location", value: info.location },
  ];

  const secondaryDetails: DetailItem[] = [
    { icon: "diversity_3", label: "Number of friends", value: String(info.numberOfFriends) },
    { icon: "checklist", label: "Goals achieved", value: String(info.goalsAchieved) },
    { icon: "favorite", label: "Favorite friend", value: info.favoriteFriend },
    { icon: "local_fire_department", label: "Streak", value: info.streak },
  ];

  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: "0px 24px 60px rgba(15, 23, 42, 0.16)",
        overflow: "hidden",
        border: "1px solid rgba(17, 17, 17, 0.08)",
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
          px: 2.5,
          py: 2,
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" minWidth={0}>
          <Avatar
            src={info.avatarUrl}
            alt={`${info.displayName} avatar`}
            sx={{
              width: 56,
              height: 56,
              fontSize: 24,
              bgcolor: "secondary.main",
              color: "common.white",
              fontWeight: 700,
            }}
          >
            {info.displayName.charAt(0)}
          </Avatar>
          <Stack spacing={0.25} minWidth={0}>
            <Typography variant="h6" fontWeight={700} noWrap>
              {info.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {info.username}
            </Typography>
          </Stack>
        </Stack>
        <Chip
          label={info.badgeLabel ?? "Verified"}
          size="small"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            bgcolor: "#111111",
            color: "#ffffff",
            px: 0.5,
          }}
        />
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <Stack spacing={2}>
          <InfoGroup items={primaryDetails} />
          <InfoGroup items={secondaryDetails} />
          <Stack spacing={1}>
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant === "danger" ? "outlined" : "contained"}
                color={action.variant === "danger" ? "error" : "primary"}
                onClick={(event) => {
                  event.stopPropagation();
                  onAction(action);
                }}
                fullWidth
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

interface DetailItem {
  icon: string;
  label: string;
  value: string;
}

interface InfoGroupProps {
  items: DetailItem[];
}

function InfoGroup({ items }: InfoGroupProps) {
  return (
    <Stack
      spacing={1}
      sx={{
        bgcolor: "rgba(17,17,17,0.04)",
        borderRadius: 1.5,
        border: "1px solid rgba(17,17,17,0.06)",
        p: 2,
      }}
    >
      {items.map((item) => (
        <Stack key={item.label} direction="row" alignItems="center" spacing={1.5}>
          <span className="material-symbols-rounded" style={{ color: "#111111" }}>
            {item.icon}
          </span>
          <Stack spacing={0.25}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1.1}>
              {item.label}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {item.value}
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
