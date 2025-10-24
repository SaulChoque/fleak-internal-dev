"use client";

import { ChangeEvent, MouseEvent, useRef, useState } from "react";
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { HomeActivity } from "@/app/types/home";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";

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

  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const [pendingFinishFile, setPendingFinishFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasStarted = dayjs().isAfter(dayjs(activity.start));
  const saveLabel = isNew ? "Create activity" : hasStarted ? "Finish" : "Save changes";

  const amountLabel = `${activity.amountValue > 0 ? "+" : activity.amountValue < 0 ? "" : ""}${activity.amountValue} ${activity.amountUnit}`;

  // Handlers for finish flow (capture final photo and confirm)
  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
    handleStopPropagation(event);
    if (isNew || !hasStarted) {
      // create or save as usual
      onSave?.(activity.id);
      return;
    }

    // When activity has started and button is 'Finish' -> start capture
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPendingFinishFile(file);
    // open confirm modal to finalize
    setFinishConfirmOpen(true);
    // reset the input so same file can be picked again later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmFinish = () => {
    // Here we could send the file to backend or propagate the finish action
    setFinishConfirmOpen(false);
    // notify parent that activity finished (reuse onSave callback)
    onSave?.(activity.id);
    setPendingFinishFile(null);
  };

  const handleCancelFinish = () => {
    setFinishConfirmOpen(false);
    setPendingFinishFile(null);
  };

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
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel id={`${activity.id}-type-select-label`}>Type</InputLabel>
              <Select
                labelId={`${activity.id}-type-select-label`}
                label="Type"
                value={activity.type ?? "custom"}
                onChange={(event) =>
                  onChange(activity.id, { type: event.target.value as HomeActivity["type"], typeLabel: String(event.target.value) })
                }
                onClick={handleStopPropagation}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={"alarm"}>Alarm</MenuItem>
                <MenuItem value={"timer"}>Timer</MenuItem>
                <MenuItem value={"custom"}>Custom</MenuItem>
              </Select>
            </FormControl>
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
            />
          </Stack>

          {/* Conditional controls based on selected type */}
          {activity.type === "alarm" ? (
            <TimePicker
              label="Alarm time"
              value={activity.alarmTime ? dayjs(activity.alarmTime) : null}
              onChange={(value) => {
                if (!value) return;
                onChange(activity.id, { alarmTime: value.toISOString() });
              }}
              renderInput={(params) => (
                <TextField {...params} onClick={handleStopPropagation} InputProps={{ sx: { borderRadius: 2 } }} />
              )}
            />
          ) : null}

          {activity.type === "timer" ? (
            <TimePicker
              label="Max time a day"
              value={activity.timerMax ? dayjs(activity.timerMax) : null}
              onChange={(value) => {
                if (!value) return;
                onChange(activity.id, { timerMax: value.toISOString() });
              }}
              renderInput={(params) => (
                <TextField {...params} onClick={handleStopPropagation} InputProps={{ sx: { borderRadius: 2 } }} />
              )}
            />
          ) : null}

          {activity.type === "custom" ? (
            <TextField
              label="Description"
              value={activity.description ?? ""}
              onChange={(event) => onChange(activity.id, { description: event.target.value })}
              onClick={handleStopPropagation}
              multiline
              minRows={2}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          ) : null}

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

          {activity.type === "custom" ? (
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <span className="material-symbols-rounded">photo_camera</span>
                <Typography variant="body2" fontWeight={600}>
                  Capture initial photo
                </Typography>
              </Stack>
              <Switch
                checked={Boolean(activity.captureInitialPhoto)}
                onChange={(event, checked) => onChange(activity.id, { captureInitialPhoto: checked })}
                onClick={handleStopPropagation}
                inputProps={{ "aria-label": "Capture initial photo" }}
              />
            </Stack>
          ) : null}

          <Stack spacing={1.25}>
            {activity.type === "custom" ? (
              <>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel id={`${activity.id}-testimony-type-label`}>Type of testimony</InputLabel>
                  <Select
                    labelId={`${activity.id}-testimony-type-label`}
                    label="Type of testimony"
                    value={activity.testimonyType ?? "friends"}
                    onChange={(event) => onChange(activity.id, { testimonyType: event.target.value as HomeActivity["testimonyType"] })}
                    onClick={handleStopPropagation}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value={"friends"}>Friends</MenuItem>
                    <MenuItem value={"AI"}>AI</MenuItem>
                  </Select>
                </FormControl>

                {activity.testimonyType === "friends" ? (
                  <Stack>
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
                ) : null}
              </>
            ) : null}
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
              onClick={(event) => handleActionClick(event as unknown as MouseEvent<HTMLButtonElement>)}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              {saveLabel}
            </Button>
            {/* hidden file input used for capturing final photo when finishing */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFileChange(e)}
            />
            <ConfirmModal
              isOpen={finishConfirmOpen}
              title={pendingFinishFile ? `Finish activity and upload ${pendingFinishFile.name}?` : "Finish activity?"}
              description={pendingFinishFile ? `File selected: ${pendingFinishFile.name}` : "Confirm finishing this activity."}
              confirmLabel="Finish"
              onCancel={handleCancelFinish}
              onConfirm={handleConfirmFinish}
            />
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
