"use client";

import { ChangeEvent, MouseEvent, SyntheticEvent, useMemo, useRef, useState } from "react";
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
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { HomeActivity } from "@/app/types/home";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";

export type HomeActivityChange = Partial<HomeActivity>;

type ValidationField =
  | "title"
  | "amount"
  | "start"
  | "end"
  | "type"
  | "alarmTime"
  | "timerMax"
  | "description"
  | "testifiers";

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
  const handleStopPropagation = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const [pendingFinishCapture, setPendingFinishCapture] = useState<{ name: string; dataUrl: string } | null>(null);
  const [finishCaptureError, setFinishCaptureError] = useState<string | null>(null);
  const [initialPhotoError, setInitialPhotoError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<ValidationField, boolean>>>({});
  const initialPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const finishPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const hasStarted = dayjs().isAfter(dayjs(activity.start));
  const currentType = activity.type ?? "custom";
  const currentTestimonyType = activity.testimonyType ?? "friends";
  const saveLabel = isNew ? "Create activity" : hasStarted ? "Finish" : "Save changes";

  const amountLabel = `${activity.amountValue > 0 ? "+" : activity.amountValue < 0 ? "" : ""}${activity.amountValue} ${activity.amountUnit}`;

  const markTouched = (field: ValidationField) => {
    setTouchedFields((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  };

  const validationErrors = useMemo(() => {
    const issues: Partial<Record<ValidationField, string>> = {};

    if (!activity.title?.trim()) {
      issues.title = "Activity name is required.";
    }

    if (!Number.isFinite(activity.amountValue)) {
      issues.amount = "Enter a valid number.";
    }

    const startValue = dayjs(activity.start);
    const endValue = dayjs(activity.end);
    if (!startValue.isValid()) {
      issues.start = "Select a valid start date.";
    }
    if (!endValue.isValid()) {
      issues.end = "Select a valid end date.";
    } else if (startValue.isValid() && !endValue.isAfter(startValue)) {
      issues.end = "End must be after start.";
    }

    if (!activity.type) {
      issues.type = "Choose an activity type.";
    }

    if (currentType === "alarm" && !activity.alarmTime) {
      issues.alarmTime = "Alarm time is required.";
    }

    if (currentType === "timer" && !activity.timerMax) {
      issues.timerMax = "Define the maximum time per day.";
    }

    if (currentType === "custom") {
      if (!activity.description?.trim()) {
        issues.description = "Add a short description.";
      }
      if (currentTestimonyType === "friends" && activity.testifiers.length === 0) {
        issues.testifiers = "Add at least one testifier.";
      }
    }

    return issues;
  }, [activity, currentType, currentTestimonyType]);

  const getFieldError = (field: ValidationField) => {
    const message = validationErrors[field];
    if (!message) return undefined;
    if (showErrors || touchedFields[field]) {
      return message;
    }
    return undefined;
  };

  const disableInlineSave = !hasStarted && showErrors && Object.keys(validationErrors).length > 0;

  const typeLabelMap: Record<"alarm" | "timer" | "custom", string> = {
    alarm: "Alarm",
    timer: "Timer",
    custom: "Custom",
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Invalid file result"));
        }
      };
      reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
      reader.readAsDataURL(file);
    });

  // Handlers for finish flow (capture final photo and confirm)
  const handleActionClick = (event: MouseEvent<HTMLButtonElement>) => {
    handleStopPropagation(event);
    if (isNew || !hasStarted) {
      setShowErrors(true);
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
      if (!disableInlineSave) {
        onSave?.(activity.id);
      }
      return;
    }

    if (finishCaptureError) {
      setFinishCaptureError(null);
    }
    finishPhotoInputRef.current?.click();
  };

  const handleFinishPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    readFileAsDataUrl(file)
      .then((dataUrl) => {
        setPendingFinishCapture({ name: file.name, dataUrl });
        setFinishConfirmOpen(true);
      })
      .catch(() => {
        setFinishCaptureError("We couldn't read the image. Please try again.");
      })
      .finally(() => {
        if (finishPhotoInputRef.current) {
          finishPhotoInputRef.current.value = "";
        }
      });
  };

  const handleConfirmFinish = () => {
    if (!pendingFinishCapture) {
      setFinishCaptureError("Select a photo before finishing.");
      return;
    }

    onChange(activity.id, {
      finalPhotoData: pendingFinishCapture.dataUrl,
      finalPhotoName: pendingFinishCapture.name,
    });

    setFinishConfirmOpen(false);
    setFinishCaptureError(null);
    onSave?.(activity.id);
    setPendingFinishCapture(null);
  };

  const handleCancelFinish = () => {
    setFinishConfirmOpen(false);
    setPendingFinishCapture(null);
  };

  const handleInitialPhotoClick = (event: MouseEvent<HTMLButtonElement>) => {
    handleStopPropagation(event);
    if (initialPhotoError) {
      setInitialPhotoError(null);
    }
    initialPhotoInputRef.current?.click();
  };

  const handleInitialPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    readFileAsDataUrl(file)
      .then((dataUrl) => {
        onChange(activity.id, {
          initialPhotoData: dataUrl,
          initialPhotoName: file.name,
          captureInitialPhoto: true,
        });
      })
      .catch(() => {
        setInitialPhotoError("We couldn't access the camera. Try again.");
      })
      .finally(() => {
        if (initialPhotoInputRef.current) {
          initialPhotoInputRef.current.value = "";
        }
      });
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
            onBlur={() => markTouched("title")}
            onClick={handleStopPropagation}
            variant="outlined"
            fullWidth
            error={Boolean(getFieldError("title"))}
            helperText={getFieldError("title")}
            InputProps={{ sx: { borderRadius: 2 } }}
          />

          {currentType === "custom" ? (
            <TextField
              label="Description"
              value={activity.description ?? ""}
              onChange={(event) => onChange(activity.id, { description: event.target.value })}
              onBlur={() => markTouched("description")}
              onClick={handleStopPropagation}
              multiline
              minRows={2}
              error={Boolean(getFieldError("description"))}
              helperText={getFieldError("description")}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          ) : null}

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
            <FormControl sx={{ minWidth: 140 }} error={Boolean(getFieldError("type"))}>
              <InputLabel id={`${activity.id}-type-select-label`}>Type</InputLabel>
              <Select
                labelId={`${activity.id}-type-select-label`}
                label="Type"
                value={currentType}
                onChange={(event) => {
                  const selectedType = event.target.value as HomeActivity["type"];
                  const nextType = selectedType ?? "custom";
                  onChange(activity.id, {
                    type: nextType,
                    typeLabel: typeLabelMap[nextType] ?? activity.typeLabel,
                  });
                  markTouched("type");
                }}
                onOpen={() => markTouched("type")}
                onClick={handleStopPropagation}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={"alarm"}>Alarm</MenuItem>
                <MenuItem value={"timer"}>Timer</MenuItem>
                <MenuItem value={"custom"}>Custom</MenuItem>
              </Select>
              {getFieldError("type") ? <FormHelperText>{getFieldError("type")}</FormHelperText> : null}
            </FormControl>
            <TextField
              label="Amount"
              type="number"
              value={activity.amountValue}
              onChange={(event) => onChange(activity.id, { amountValue: Number(event.target.value || 0) })}
              onBlur={() => markTouched("amount")}
              onClick={handleStopPropagation}
              error={Boolean(getFieldError("amount"))}
              helperText={getFieldError("amount")}
              InputProps={{
                sx: { borderRadius: 2 },
                endAdornment: <Typography variant="caption">{activity.amountUnit}</Typography>,
              }}
            />
            <DateTimePicker
              label="Start"
              value={dayjs(activity.start)}
              onChange={(value) => {
                markTouched("start");
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
                  onBlur: () => markTouched("start"),
                  error: Boolean(getFieldError("start")),
                  helperText: getFieldError("start"),
                  onPointerDownCapture: handleStopPropagation,
                },
              }}
            />
            <DateTimePicker
              label="End"
              value={dayjs(activity.end)}
              onChange={(value) => {
                markTouched("end");
                if (!value) return;
                onChange(activity.id, { end: value.toISOString() });
              }}
              sx={{
                "& .MuiInputBase-root": { borderRadius: 2 },
              }}
              slotProps={{
                textField: {
                  onBlur: () => markTouched("end"),
                  error: Boolean(getFieldError("end")),
                  helperText: getFieldError("end"),
                  onPointerDownCapture: handleStopPropagation,
                },
              }}
            />
          </Stack>

          {/* Conditional controls based on selected type */}
          {currentType === "alarm" ? (
            <TimePicker
              label="Alarm time"
              value={activity.alarmTime ? dayjs(activity.alarmTime) : null}
              onChange={(value) => {
                markTouched("alarmTime");
                if (!value) return;
                onChange(activity.id, { alarmTime: value.toISOString() });
              }}
              slotProps={{
                textField: {
                  InputProps: { sx: { borderRadius: 2 } },
                  onBlur: () => markTouched("alarmTime"),
                  error: Boolean(getFieldError("alarmTime")),
                  helperText: getFieldError("alarmTime"),
                  onPointerDownCapture: handleStopPropagation,
                },
              }}
            />
          ) : null}

          {currentType === "timer" ? (
            <TimePicker
              label="Max time a day"
              value={activity.timerMax ? dayjs(activity.timerMax) : null}
              onChange={(value) => {
                markTouched("timerMax");
                if (!value) return;
                onChange(activity.id, { timerMax: value.toISOString() });
              }}
              slotProps={{
                textField: {
                  InputProps: { sx: { borderRadius: 2 } },
                  onBlur: () => markTouched("timerMax"),
                  error: Boolean(getFieldError("timerMax")),
                  helperText: getFieldError("timerMax"),
                  onPointerDownCapture: handleStopPropagation,
                },
              }}
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

          {currentType === "custom" ? (
            <Stack spacing={0.75}
              sx={{
                border: "1px dashed rgba(17,17,17,0.16)",
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <span className="material-symbols-rounded">photo_camera</span>
                  <Typography variant="body2" fontWeight={600}>
                    Capture initial photo
                  </Typography>
                </Stack>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<span className="material-symbols-rounded">add_a_photo</span>}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                  onClick={handleInitialPhotoClick}
                >
                  {activity.initialPhotoData ? "Retake" : "Capture"}
                </Button>
              </Stack>
              <Typography variant="caption" color={activity.initialPhotoData ? "text.secondary" : "text.disabled"}>
                {activity.initialPhotoName ? `Captured: ${activity.initialPhotoName}` : "No photo captured yet"}
              </Typography>
              {initialPhotoError ? (
                <Typography variant="caption" color="error">
                  {initialPhotoError}
                </Typography>
              ) : null}
            </Stack>
          ) : null}

          <Stack spacing={1.25}>
            {currentType === "custom" ? (
              <>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel id={`${activity.id}-testimony-type-label`}>Type of testimony</InputLabel>
                  <Select
                    labelId={`${activity.id}-testimony-type-label`}
                    label="Type of testimony"
                    value={currentTestimonyType}
                    onChange={(event) =>
                      onChange(activity.id, {
                        testimonyType: event.target.value as HomeActivity["testimonyType"],
                      })
                    }
                    onBlur={() => markTouched("testifiers")}
                    onClick={handleStopPropagation}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value={"friends"}>Friends</MenuItem>
                    <MenuItem value={"AI"}>AI</MenuItem>
                  </Select>
                </FormControl>

                {currentTestimonyType === "friends" ? (
                  <Stack spacing={0.75}>
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
                          markTouched("testifiers");
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
                    {getFieldError("testifiers") ? (
                      <Typography variant="caption" color="error">
                        {getFieldError("testifiers")}
                      </Typography>
                    ) : null}
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
              disabled={disableInlineSave}
            >
              {saveLabel}
            </Button>
            {finishCaptureError ? (
              <Typography variant="caption" color="error" sx={{ alignSelf: "center" }}>
                {finishCaptureError}
              </Typography>
            ) : null}
            {/* hidden file input used for capturing final photo when finishing */}
            <input
              ref={initialPhotoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleInitialPhotoChange}
            />
            <input
              ref={finishPhotoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleFinishPhotoChange}
            />
            <ConfirmModal
              isOpen={finishConfirmOpen}
              title={pendingFinishCapture ? `Finish activity with ${pendingFinishCapture.name}?` : "Finish activity?"}
              description={pendingFinishCapture ? `This will save the final photo and mark the activity as finished.` : "Take a photo to finalize this activity."}
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
