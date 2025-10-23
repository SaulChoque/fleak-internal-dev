"use client";

import { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { FinanceController } from "@/app/controllers/financeController";
import { FinanceActivity, FinanceBalance } from "@/app/types/finance";
import { FinanceSummaryCard } from "@/app/components/cards/FinanceSummaryCard";

export function FinanceView() {
  const [balance, setBalance] = useState<FinanceBalance | undefined>();
  const [activity, setActivity] = useState<FinanceActivity[]>([]);

  useEffect(() => {
    FinanceController.getBalance().then(setBalance);
    FinanceController.getActivity().then(setActivity);
  }, []);

  return (
    <Stack spacing={3} sx={{ width: "100%", maxWidth: 720, mx: "auto", py: 2 }}>
      {balance ? <FinanceSummaryCard balance={balance} activity={activity} /> : null}
{/*       <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: "background.paper", boxShadow: "0px 18px 48px rgba(15, 23, 42, 0.08)" }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Recent activity
        </Typography>
        <List disablePadding>
          {activity.map((item, index) => (
            <Stack key={item.id}>
              <ListItem disableGutters sx={{ py: 1.25 }}>
                <ListItemText
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ color: "text.secondary", variant: "caption" }}
                  primary={item.title}
                  secondary={item.timestamp}
                />
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={item.type === "credit" ? "success.main" : "error.main"}
                >
                  {item.amount}gdfg
                </Typography>
              </ListItem>
              {index < activity.length - 1 ? <Divider flexItem /> : null}
            </Stack>
          ))}
        </List>
      </Paper> */}
    </Stack>
  );
}
