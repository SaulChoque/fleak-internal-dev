"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  Box,
  Typography,
  Button,
  MobileStepper,
  Fade,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { useAuthenticate, useMiniKit } from "@coinbase/onchainkit/minikit";

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
}

const createOnboardingSteps = (name: string) => [
  {
    icon: "alarm_on",
    title: "Turn intent into action",
    description: `${name}, Fleak is the commitment layer for Base. Every promise becomes a trackable mission with real stakes and receipts.`,
  },
  {
    icon: "paid",
    title: "Stake your goals",
    description:
      "Lock a forfeit on Base. Hit the target and reclaim everything, miss it and the loss nudges you to recalibrate and try again.",
  },
  {
    icon: "fact_check",
    title: "Smarter verification",
    description:
      "Pick automatic, social, or Gemini AI review. The Court of Truth checks evidence, seals the verdict, and keeps every Flake fair.",
  },
  {
    icon: "groups_3",
    title: "Challenge your circle",
    description:
      "Invite friends, launch head-to-head battles, and let social pressure work for you. Winner takes the pot, pride, and streak.",
  },
  {
    icon: "local_fire_department",
    title: "Protect your streak",
    description:
      "Each win fuels your streak and on-chain reputation. Keep the flame alive and become the teammate everyone trusts.",
  },
];

export function OnboardingFlow({ open, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { signIn } = useAuthenticate();
  const { context } = useMiniKit();

  const fallbackName = context?.user?.displayName || context?.user?.username || "Friend";
  const shortName = useMemo(
    () => fallbackName.replace(/^@/, "").split(" ")[0] || "Friend",
    [fallbackName]
  );
  const steps = useMemo(() => createOnboardingSteps(shortName), [shortName]);

  const isLastStep = currentStep === steps.length - 1;
  const maxSteps = steps.length;

  const handleComplete = (userInfo: { fid?: number; [key: string]: unknown }) => {
    const identifier = userInfo.fid || context?.user?.fid || "default";
    localStorage.setItem(`onboarding:${identifier}`, "completed");
    onComplete();
  };

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const result = await signIn();
      if (!result) {
        setAuthError("We could not authenticate you. Please try again.");
      } else {
        setIsAuthenticated(true);
        handleComplete(result as { fid?: number; [key: string]: unknown });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthError("We could not authenticate you. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding:guest", "skipped");
    onComplete();
  };

  const handleNext = () => {
    if (currentStep < maxSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const displayName = context?.user?.displayName || fallbackName;

  const renderSymbol = (symbol: string, size = 24, color?: string) => (
    <span
      className="material-symbols-rounded"
      style={{ fontSize: size, lineHeight: 1, display: "inline-flex", color }}
      aria-hidden
    >
      {symbol}
    </span>
  );

  return (
    <Dialog
      open={open}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 4,
          py: 6,
          textAlign: "center",
        }}
      >
        <Fade in={true} timeout={600} key={currentStep}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              maxWidth: 400,
            }}
          >
            <Stack spacing={2} alignItems="center" sx={{ width: "100%" }}>
              <Image
                src="/logos/logo.webp"
                alt="Fleak orb logo"
                width={104}
                height={104}
                priority
              />
              <Image
                src="/logos/logotext.png"
                alt="Fleak wordmark"
                width={176}
                height={44}
                priority
              />
            </Stack>

            <Box
              sx={{
                width: 112,
                height: 112,
                borderRadius: "32px",
                bgcolor: "rgba(2, 124, 218, 0.1)",
                border: "1px solid rgba(2, 54, 130, 0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 16px 40px rgba(2, 54, 130, 0.18)",
              }}
            >
              {renderSymbol(currentStepData.icon, 60, "#027cda")}
            </Box>

            <Typography
              variant="h4"
              fontWeight={700}
              color="text.primary"
              sx={{ mt: 2 }}
            >
              {currentStepData.title}
            </Typography>

            {/* Descripción */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.7 }}
            >
              {currentStepData.description}
            </Typography>

            {/* Última pantalla: Auth */}
            {isLastStep && !isAuthenticated && (
              <Box sx={{ width: "100%", mt: 2 }}>
                {authError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {authError}
                  </Alert>
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Hey {displayName}, authenticate to unlock the full Fleak experience.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleAuthenticate}
                    disabled={isAuthenticating}
                    startIcon={
                      isAuthenticating ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        renderSymbol("login")
                      )
                    }
                  >
                    {isAuthenticating ? "Connecting..." : "Sign in with Base"}
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleSkip}
                    disabled={isAuthenticating}
                    startIcon={renderSymbol("travel_explore")}
                  >
                    Continue without signing in
                  </Button>
                </Box>
              </Box>
            )}

            {isLastStep && isAuthenticated && (
              <Box sx={{ width: "100%", mt: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress />
                </Box>
              </Box>
            )}
          </Box>
        </Fade>
      </Box>

      {/* Controles de navegación */}
      <Box
        sx={{
          px: 4,
          pb: 4,
        }}
      >
        <MobileStepper
          variant="dots"
          steps={maxSteps}
          position="static"
          activeStep={currentStep}
          sx={{
            bgcolor: "transparent",
            "& .MuiMobileStepper-dot": {
              width: 8,
              height: 8,
            },
            "& .MuiMobileStepper-dotActive": {
              bgcolor: "primary.main",
            },
          }}
          nextButton={
            !isLastStep ? (
              <Button size="large" onClick={handleNext} endIcon={renderSymbol("arrow_forward")}>
                Next
              </Button>
            ) : (
              <div style={{ width: 100 }} />
            )
          }
          backButton={
            <Button
              size="large"
              onClick={handleBack}
              disabled={currentStep === 0}
              startIcon={renderSymbol("arrow_back")}
            >
              Back
            </Button>
          }
        />
      </Box>
    </Dialog>
  );
}
