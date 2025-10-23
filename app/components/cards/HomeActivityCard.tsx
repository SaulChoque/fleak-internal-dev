"use client";

import { ChangeEvent, MouseEvent } from "react";
import dayjs from "dayjs";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { HomeActivity } from "@/app/types/home";

export type HomeActivityChange = Partial<HomeActivity>;

interface HomeActivityCardProps {
  activity: HomeActivity;
  isExpanded: boolean;
  isNew?: boolean;
  onToggle: (id: string) => void;
  onChange: (id: string, changes: HomeActivityChange) => void;
  onManageTestifiers: (id: string) => void;
  onRemoveTestifier?: (id: string, username: string) => void;
  onCancel?: (id: string) => void;
  onSave?: (id: string) => void;
}

const amountPalette: Record<HomeActivity["amountType"], string> = {
  credit: "#111111",
  debit: "rgba(17,17,17,0.45)",
  neutral: "rgba(17,17,17,0.45)",
};

export function HomeActivityCard({
  activity,
  isExpanded,
  isNew = false,
  onToggle,
  onChange,
  onManageTestifiers,
  onRemoveTestifier,
  onCancel,
  onSave,
}: HomeActivityCardProps) {
  const handleToggle = () => onToggle(activity.id);

  const handleStopPropagation = (event: MouseEvent | ChangeEvent) => {
    event.stopPropagation();
  };

  const saveLabel = isNew ? "Create activity" : "Save changes";

  const amountLabel = `${activity.amountValue > 0 ? "+" : activity.amountValue < 0 ? "" : ""}${activity.amountValue} ${activity.amountUnit}`;

  return (
    <Accordion
      disableGutters
      square
      elevation={0}
      expanded={isExpanded}
      onChange={handleToggle}
      sx={{
        borderRadius: 2,
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
              category
            </span>
            <Typography variant="body2" color="text.secondary">
              {activity.typeLabel}
            </Typography>
          </Stack>
        </Stack>
        <Stack spacing={0.25} alignItems="flex-end">
          <Typography variant="h5" fontWeight={700} color="text.primary">
            {activity.summaryTimeLabel}
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ color: amountPalette[activity.amountType] }}>
            {amountLabel}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.25, pb: 2.5, pt: 0 }}>
        <Stack spacing={2.25}>
          <TextField
            label="Activity name"
            value={activity.title}
            onChange={(event) => onChange(activity.id, { title: event.target.value })}
            onClick={handleStopPropagation}
            variant="outlined"
            fullWidth
            InputProps={{ sx: { borderRadius: 2 } }}
          />

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack spacing={0.25}>
              <Typography variant="subtitle2" fontWeight={700}>
                {activity.repeatLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Toggle to keep this activity active.
              </Typography>
            </Stack>
            <Switch
              checked={activity.isActive}
              onChange={(event, checked) => onChange(activity.id, { isActive: checked })}
              onClick={handleStopPropagation}
              onMouseDown={handleStopPropagation}
              inputProps={{ "aria-label": "Activity enable" }}
            />
          </Stack>

          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {activity.days.map((day) => (
              <Chip
                key={`${activity.id}-day-${day.id}`}
                label={day.label}
                size="small"
                onClick={(event) => {
                  handleStopPropagation(event);
                  const updatedDays = activity.days.map((entry) =>
                    entry.id === day.id ? { ...entry, isActive: !entry.isActive } : entry,
                  );
                  onChange(activity.id, { days: updatedDays });
                }}
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

          <Stack
            spacing={2}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            }}
          >
            <TextField
              label="Type"
              value={activity.typeLabel}
              onChange={(event) => onChange(activity.id, { typeLabel: event.target.value })}
              onClick={handleStopPropagation}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              label="Amount"
              type="number"
              value={activity.amountValue}
              onChange={(event) => onChange(activity.id, { amountValue: Number(event.target.value || 0) })}
              onClick={handleStopPropagation}
              InputProps={{
                sx: { borderRadius: 2 },
                endAdornment: <Typography variant="caption">{activity.amountUnit}</Typography>,
              }}
            />
            <DateTimePicker
              label="Start"
              value={dayjs(activity.start)}
              onChange={(value) => {
                if (!value) return;
                onChange(activity.id, {
                  start: value.toISOString(),
                  summaryTimeLabel: value.format("HH:mm"),
                });
              }}
              sx={{
                "& .MuiInputBase-root": { borderRadius: 2 },
              }}
              slotProps={{
                textField: {
                  onClick: handleStopPropagation,
                },
              }}
            />
            <DateTimePicker
              label="End"
              value={dayjs(activity.end)}
              onChange={(value) => {
                if (!value) return;
                onChange(activity.id, { end: value.toISOString() });
              }}
              sx={{
                "& .MuiInputBase-root": { borderRadius: 2 },
              }}
              slotProps={{
                textField: {
                  onClick: handleStopPropagation,
                },
              }}
            />
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <span className="material-symbols-rounded">notifications</span>
              <Typography variant="body2" fontWeight={600}>
                Notifications
              </Typography>
            </Stack>
            <Switch
              checked={activity.notificationsEnabled}
              onChange={(event, checked) => onChange(activity.id, { notificationsEnabled: checked })}
              onClick={handleStopPropagation}
              onMouseDown={handleStopPropagation}
              inputProps={{ "aria-label": "Notifications toggle" }}
            />
          </Stack>

          <Stack spacing={1.25}>
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
                onClick={(event) => {
                  handleStopPropagation(event);
                  onManageTestifiers(activity.id);
                }}
              >
                Manage
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {activity.testifiers.map((testifier) => (
                <Chip
                  key={`${activity.id}-testifier-${testifier}`}
                  label={testifier}
                  onClick={handleStopPropagation}
                  onDelete={onRemoveTestifier ? () => onRemoveTestifier(activity.id, testifier) : undefined}
                  deleteIcon={<span className="material-symbols-rounded">close</span>}
                  sx={{ borderRadius: 2, bgcolor: "rgba(17,17,17,0.08)" }}
                />
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            <IconButton
              onClick={(event) => {
                handleStopPropagation(event);
                onToggle(activity.id);
              }}
              sx={{ bgcolor: "rgba(17,17,17,0.06)", borderRadius: 2 }}
            >
              <span className="material-symbols-rounded">expand_less</span>
            </IconButton>
            <Button
              variant="outlined"
              color="error"
              onClick={(event) => {
                handleStopPropagation(event);
                onCancel?.(activity.id);
              }}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              {isNew ? "Discard" : "Close"}
            </Button>
            <Button
              variant="contained"
              onClick={(event) => {
                handleStopPropagation(event);
                onSave?.(activity.id);
              }}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              {saveLabel}
            </Button>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
