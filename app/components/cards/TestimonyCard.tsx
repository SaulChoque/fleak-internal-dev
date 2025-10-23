"use client";

import { MouseEvent } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Testimony } from "@/app/types/testimony";

interface TestimonyCardProps {
  testimony: Testimony;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onAction?: (testimony: Testimony, actionId: string) => void;
}

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "error"> = {
  Approved: "success",
  Pending: "warning",
  Rejected: "error",
};

export function TestimonyCard({ testimony, isExpanded, onToggle, onAction }: TestimonyCardProps) {
  const statusColor = STATUS_COLORS[testimony.statusLabel] ?? "default";

  const handleActionClick = (event: MouseEvent<HTMLButtonElement>, actionId: string) => {
    event.stopPropagation();
    onAction?.(testimony, actionId);
  };

  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={isExpanded}
      onChange={() => onToggle(testimony.id)}
      square
      sx={{
        borderRadius: 1.5,
        bgcolor: "background.paper",
        boxShadow: "0px 18px 48px rgba(15, 23, 42, 0.12)",
        overflow: "hidden",
        transition: "box-shadow 0.3s ease",
        border: "1px solid rgba(17, 17, 17, 0.08)",
        "&:before": { display: "none" },
        "& .MuiAccordionSummary-root": {
          borderRadius: 0,
        },
        "& .MuiAccordionDetails-root": {
          borderRadius: 0,
        },
        "&.Mui-expanded": {
          boxShadow: "0px 24px 64px rgba(0, 0, 0, 0.28)",
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
            gap: 2,
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} minWidth={0}>
          <Stack spacing={0.5} minWidth={0}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <span className="material-symbols-rounded" style={{ color: "#000000ff" }}>
                task_alt
              </span>
              <Chip label={testimony.statusLabel} size="small" color={statusColor} sx={{ fontWeight: 600 }} />
            </Stack>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {testimony.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {testimony.scheduleLabel}
            </Typography>
          </Stack>
        </Stack>
        <Typography variant="h6" fontWeight={700} color="primary.main">
          {testimony.amount}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <Stack spacing={1.25}>
          {testimony.details.map((detail) => {
            const actionId = detail.actionId;
            const iconColor = detail.icon === "chat" ? "#1e88e5" : detail.icon === "calendar_today" ? "#ef6c00" : "#000000ff";

            return (
              <Box
                key={detail.id}
                display="flex"
                alignItems="center"
                gap={1.5}
                px={1.25}
                py={1}
                borderRadius={2}
                sx={{
                  bgcolor: "action.hover",
                }}
              >
                <span className="material-symbols-rounded" style={{ color: iconColor }}>
                  {detail.icon}
                </span>
                <Stack flexGrow={1} minWidth={0} spacing={0.25}>
                  <Typography variant="body2" fontWeight={600}>
                    {detail.label}
                  </Typography>
                  {detail.value ? (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {detail.value}
                    </Typography>
                  ) : null}
                </Stack>
                {actionId ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={(event) => handleActionClick(event, actionId)}
                    sx={{ textTransform: "none", borderRadius: 999 }}
                  >
                    {detail.actionLabel ?? "Open"}
                  </Button>
                ) : null}
              </Box>
            );
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
