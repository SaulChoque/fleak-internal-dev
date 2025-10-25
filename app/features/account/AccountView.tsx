"use client";

import { useEffect, useState } from "react";
import { Alert, Snackbar, Stack } from "@mui/material";
import { AccountController } from "@/app/controllers/accountController";
import { AccountAction, AccountInfo } from "@/app/types/account";
import { AccountInfoCard } from "@/app/components/cards/AccountInfoCard";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";

export function AccountView() {
  const [account, setAccount] = useState<AccountInfo | undefined>();
  const [actions, setActions] = useState<AccountAction[]>([]);
  const [pendingAction, setPendingAction] = useState<AccountAction | undefined>();
   const [actionError, setActionError] = useState<string | undefined>();
   const [isProcessingAction, setIsProcessingAction] = useState(false);
   const [feedback, setFeedback] = useState<{ message: string; severity: "success" | "error" } | undefined>();

  useEffect(() => {
    AccountController.getAccount().then(setAccount);
    AccountController.getActions().then(setActions);
  }, []);

  const handleCancelAction = () => {
    if (isProcessingAction) {
      return;
    }
    setPendingAction(undefined);
    setActionError(undefined);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) {
      return;
    }

    setIsProcessingAction(true);
    setActionError(undefined);

    try {
      switch (pendingAction.id) {
        case "logout": {
          await AccountController.logout();
          setPendingAction(undefined);
          window.location.href = "/";
          return;
        }
        case "share-profile": {
          if (!account) {
            throw new Error("We need your account data before sharing.");
          }

          const sharePayload = {
            title: `Fleak • ${account.displayName}`,
            text: `Join me on Fleak! My username is ${account.username}.`,
            url: typeof window !== "undefined" ? window.location.origin : undefined,
          };

          const canUseNativeShare = typeof navigator !== "undefined" && "share" in navigator;
          if (canUseNativeShare) {
            await (navigator as Navigator & { share: (data: { title: string; text: string; url?: string }) => Promise<void> }).share(
              sharePayload,
            );
            setFeedback({ severity: "success", message: "Profile shared." });
          } else if (navigator.clipboard && navigator.clipboard.writeText) {
            const shareText = `${sharePayload.text} ${sharePayload.url ?? ""}`.trim();
            await navigator.clipboard.writeText(shareText);
            setFeedback({ severity: "success", message: "Profile link copied." });
          } else {
            throw new Error("Sharing is not supported on this device.");
          }

          setPendingAction(undefined);
          break;
        }
        case "delete-account": {
          throw new Error("Account deletion is not available yet.");
        }
        default: {
          throw new Error("This action is not supported yet.");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error.";
      setActionError(message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ width: "100%", maxWidth: 680, mx: "auto", py: 2 }}>
      {account ? (
        <AccountInfoCard
          info={account}
          actions={actions}
          onAction={(action) => {
            setPendingAction(action);
            setActionError(undefined);
          }}
        />
      ) : null}
      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        title={pendingAction?.label ?? ""}
        description={
          actionError
            ? actionError
            : pendingAction
              ? `Do you want to continue with "${pendingAction.label}"?`
              : undefined
        }
        confirmLabel={isProcessingAction ? "Working..." : "Continue"}
        cancelLabel="Close"
        tone={pendingAction?.variant === "danger" ? "danger" : "default"}
        isLoading={isProcessingAction}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
      {feedback ? (
        <Snackbar
          open
          autoHideDuration={4000}
          onClose={() => setFeedback(undefined)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={feedback.severity}
            variant="filled"
            onClose={() => setFeedback(undefined)}
            sx={{ borderRadius: 2 }}
          >
            {feedback.message}
          </Alert>
        </Snackbar>
      ) : null}
    </Stack>
  );
}
