"use client";
import { useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  MobileStepper,
  Fade,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Icon } from "@mui/material";
import { useAuthenticate, useMiniKit } from "@coinbase/onchainkit/minikit";

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: "account_balance_wallet",
    title: "Bienvenido a Fleak",
    description:
      "Una nueva forma de gestionar tus finanzas sociales. Conecta, comparte y crece con tu comunidad.",
  },
  {
    icon: "groups",
    title: "Conecta con Amigos",
    description:
      "Encuentra y agrega amigos para compartir experiencias financieras y testimonios.",
  },
  {
    icon: "trending_up",
    title: "Rastrea tus Finanzas",
    description:
      "Monitorea tus ingresos, gastos y balance en tiempo real con visualizaciones claras.",
  },
  {
    icon: "verified",
    title: "Testimonios Verificados",
    description:
      "Lee y comparte testimonios verificados de la comunidad sobre productos y servicios financieros.",
  },
  {
    icon: "lock",
    title: "Seguro y Descentralizado",
    description:
      "Tu información está protegida con tecnología blockchain. Tú controlas tus datos.",
  },
];

export function OnboardingFlow({ open, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { signIn } = useAuthenticate();
  const { context } = useMiniKit();

  const isLastStep = currentStep === onboardingSteps.length - 1;
  const maxSteps = onboardingSteps.length;

  const handleComplete = (userInfo: { fid?: number; [key: string]: unknown }) => {
    // Guardar que el usuario completó el onboarding usando el fid o el contexto
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
        setAuthError("No se pudo iniciar sesión. Por favor, intenta nuevamente.");
      } else {
        // Autenticación exitosa
        setIsAuthenticated(true);
        handleComplete(result as { fid?: number; [key: string]: unknown });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthError(
        "No se pudo iniciar sesión. Por favor, intenta nuevamente."
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSkip = () => {
    // Permitir modo guest si el usuario rechaza auth
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

  const currentStepData = onboardingSteps[currentStep];
  const displayName = context?.user?.displayName || "Amigo";

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
            {/* Icono */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              }}
            >
              <Icon
                sx={{
                  fontSize: 64,
                  color: "white",
                }}
              >
                {currentStepData.icon}
              </Icon>
            </Box>

            {/* Título */}
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
                    Hola {displayName}, para usar todas las funciones necesitas iniciar sesión
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
                        <Icon>login</Icon>
                      )
                    }
                  >
                    {isAuthenticating ? "Conectando..." : "Iniciar Sesión"}
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleSkip}
                    disabled={isAuthenticating}
                  >
                    Continuar sin iniciar sesión
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
              <Button size="large" onClick={handleNext} endIcon={<Icon>arrow_forward</Icon>}>
                Siguiente
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
              startIcon={<Icon>arrow_back</Icon>}
            >
              Atrás
            </Button>
          }
        />
      </Box>
    </Dialog>
  );
}
