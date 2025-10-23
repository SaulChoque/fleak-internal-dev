"use client";

import { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { AccountController } from "@/app/controllers/accountController";
import { AccountAction, AccountInfo } from "@/app/types/account";
import { AccountInfoCard } from "@/app/components/cards/AccountInfoCard";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";

export function AccountView() {
  const [account, setAccount] = useState<AccountInfo | undefined>();
  const [actions, setActions] = useState<AccountAction[]>([]);
  const [pendingAction, setPendingAction] = useState<AccountAction | undefined>();

  useEffect(() => {
    AccountController.getAccount().then(setAccount);
    AccountController.getActions().then(setActions);
  }, []);

  return (
    <Stack spacing={3} sx={{ width: "100%", maxWidth: 680, mx: "auto", py: 2 }}>
      {account ? (
        <AccountInfoCard info={account} actions={actions} onAction={setPendingAction} />
      ) : null}
      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        title={pendingAction?.label ?? ""}
        description={pendingAction ? `Do you want to continue with "${pendingAction.label}"?` : undefined}
        confirmLabel="Continue"
        cancelLabel="Close"
        tone={pendingAction?.variant === "danger" ? "danger" : "default"}
        onConfirm={() => setPendingAction(undefined)}
        onCancel={() => setPendingAction(undefined)}
      />
    </Stack>
  );
}
