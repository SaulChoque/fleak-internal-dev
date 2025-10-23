"use client";

import { MouseEvent } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { HomeActivity } from "@/app/types/home";

interface HomeActivityCardProps {
  activity: HomeActivity;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

const amountPalette: Record<HomeActivity["amountType"], string> = {
  credit: "#111111",
  debit: "rgba(17,17,17,0.45)",
  neutral: "rgba(17,17,17,0.45)",
};

export function HomeActivityCard({ activity, isExpanded, onToggle }: HomeActivityCardProps) {
  const handleToggle = () => onToggle(activity.id);

  const handleStopPropagation = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <Accordion
      disableGutters
      square
      elevation={0}
      expanded={isExpanded}
      onChange={handleToggle}
      sx={{
        borderRadius: 1.5,
        bgcolor: "background.paper",
        boxShadow: "0px 18px 48px rgba(15, 23, 42, 0.14)",
        overflow: "hidden",
        border: "1px solid rgba(17, 17, 17, 0.08)",
        transition: "box-shadow 0.3s ease",
        "&:before": { display: "none" },
        "& .MuiAccordionSummary-root": {
          borderRadius: 0,
        },
        "& .MuiAccordionDetails-root": {
          borderRadius: 0,
        },
        "&.Mui-expanded": {
          boxShadow: "0px 26px 64px rgba(0, 0, 0, 0.24)",
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
            gap: 1.5,
          },
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(17,17,17,0.08)",
            color: "#111111",
            borderRadius: 2,
            width: 40,
            height: 40,
          }}
        >
          <span className="material-symbols-rounded">{activity.icon}</span>
        </Box>
        <Stack spacing={0.5} flexGrow={1} minWidth={0}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {activity.title}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
              info
            </span>
            <Typography variant="body2" color="text.secondary">
              {activity.description}
            </Typography>
          </Stack>
        </Stack>
        <Stack spacing={0.25} alignItems="flex-end">
          <Typography variant="h5" fontWeight={700} color="text.primary">
            {activity.timeLabel}
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ color: amountPalette[activity.amountType] }}>
            {activity.amountLabel}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.25, pb: 2.5, pt: 0 }}>
        <Stack spacing={1.75}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack spacing={0.25}>
              <Typography variant="subtitle2" fontWeight={700}>
                {activity.details.repeatLabel}
              </Typography>
            </Stack>
            <Switch
              checked={activity.details.isActive}
              onClick={handleStopPropagation}
              onMouseDown={handleStopPropagation}
              onChange={() => {}}
              inputProps={{ "aria-label": "Activity toggle" }}
            />
          </Stack>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {activity.details.days.map((day, index) => (
              <Chip
                key={`${activity.id}-day-${index}`}
                label={day.label}
                size="small"
                variant={day.isActive ? "filled" : "outlined"}
                sx={{
                  borderRadius: 2,
                  bgcolor: day.isActive ? "#111111" : "transparent",
                  color: day.isActive ? "#ffffff" : "rgba(17,17,17,0.6)",
                  borderColor: "rgba(17,17,17,0.16)",
                }}
              />
            ))}
          </Stack>
          <Divider sx={{ borderStyle: "dashed" }} />
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            }}
          >
            <InfoItem label="Type" value={activity.details.typeLabel} />
            <InfoItem label="Amount" value={activity.details.amountLabel} />
            <InfoItem label="Start" value={activity.details.startLabel} />
            <InfoItem label="End" value={activity.details.endLabel} />
          </Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <span className="material-symbols-rounded">notifications</span>
              <Typography variant="body2" fontWeight={600}>
                Notifications
              </Typography>
            </Stack>
            <Switch
              checked={activity.details.notificationsEnabled}
              onClick={handleStopPropagation}
              onMouseDown={handleStopPropagation}
              onChange={() => {}}
              inputProps={{ "aria-label": "Notifications toggle" }}
            />
          </Stack>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <span className="material-symbols-rounded">groups</span>
                <Typography variant="body2" fontWeight={600}>
                  Testifiers
                </Typography>
              </Stack>
              <Button
                variant="outlined"
                size="small"
                startIcon={<span className="material-symbols-rounded">add</span>}
                sx={{ textTransform: "none", borderRadius: 2 }}
                onClick={handleStopPropagation}
              >
                Add
              </Button>
            </Stack>
            <Stack spacing={0.75}>
              {activity.details.testifiers.map((testifier) => (
                <Stack
                  key={`${activity.id}-testifier-${testifier}`}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    bgcolor: "rgba(17,17,17,0.04)",
                    borderRadius: 2,
                    px: 1.25,
                    py: 0.75,
                  }}
                >
                  <span className="material-symbols-rounded" style={{ color: "#111111" }}>
                    check_circle
                  </span>
                  <Typography variant="body2" fontWeight={600}>
                    {testifier}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={handleStopPropagation}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1.1}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Stack>
  );
}
