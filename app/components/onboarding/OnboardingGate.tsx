"use client";
import { useState, useEffect, ReactNode } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { OnboardingFlow } from "./OnboardingFlow";
import { LoadingScreen } from "./LoadingScreen";

interface OnboardingGateProps {
  children: ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const { context } = useMiniKit();

  useEffect(() => {
    // Verificar si el usuario ya completó el onboarding
    const checkOnboardingStatus = () => {
      // Verificar si hay contexto de usuario
      const userFid = context?.user?.fid;
      
      if (userFid) {
        // Usuario autenticado: verificar si completó onboarding
        const completed = localStorage.getItem(`onboarding:${userFid}`);
        setShowOnboarding(!completed);
      } else {
        // Sin contexto: verificar si se saltó previamente
        const skipped = localStorage.getItem("onboarding:guest");
        setShowOnboarding(!skipped);
      }
      
      setIsChecking(false);
    };

    // Pequeño delay para permitir que el contexto se cargue
    const timer = setTimeout(checkOnboardingStatus, 100);
    return () => clearTimeout(timer);
  }, [context]);

  const handleComplete = () => {
    setShowOnboarding(false);
    setIsLoadingContent(true);
  };

  useEffect(() => {
    if (!isLoadingContent) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsLoadingContent(false);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [isLoadingContent]);

  const shouldRenderChildren = !showOnboarding && !isChecking;
  const loaderMessage = isChecking
    ? "Inicializando Fleak..."
    : "Sincronizando tus flakes en Base";

  return (
    <>
      <OnboardingFlow open={showOnboarding} onComplete={handleComplete} />
      {shouldRenderChildren && children}
      <LoadingScreen open={(!showOnboarding && isChecking) || isLoadingContent} message={loaderMessage} />
    </>
  );
}
