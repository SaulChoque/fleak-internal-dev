"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { FinanceActivity, FinanceBalance } from "@/app/types/finance";

interface FinanceSummaryCardProps {
  balance: FinanceBalance;
  activity: FinanceActivity[];
}

export function FinanceSummaryCard({ balance, activity }: FinanceSummaryCardProps) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: "0px 20px 54px rgba(15, 23, 42, 0.14)",
        overflow: "hidden",
        border: "1px solid rgba(17, 17, 17, 0.08)",
        "&:before": { display: "none" },
        "& .MuiAccordionSummary-root": {
          borderRadius: 0,
        },
        "& .MuiAccordionDetails-root": {
          borderRadius: 0,
        },
      }}
      defaultExpanded
    >
      <AccordionSummary
        expandIcon={<span className="material-symbols-rounded">expand_more</span>}
        sx={{
          px: 2.5,
          py: 2,
          "& .MuiAccordionSummary-content": {
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
          <Typography variant="subtitle1" fontWeight={700} flexGrow={1}>
            My finances
          </Typography>
          <Chip label={balance.currency} color="primary" size="small" />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
            account_balance_wallet
          </span>
          <Typography variant="caption" fontWeight={600} letterSpacing={0.4} textTransform="uppercase">
            {balance.address}
          </Typography>
        </Stack>
        <Typography variant="h5" fontWeight={700}>
          {balance.formatted}
        </Typography>
        <Stack direction="row" spacing={1} width="100%">
          <Button
            variant="contained"
            fullWidth
            sx={{ textTransform: "none", borderRadius: 2 }}
            onClick={(event) => event.stopPropagation()}
          >
            Deposit
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ textTransform: "none", borderRadius: 2 }}
            onClick={(event) => event.stopPropagation()}
          >
            Withdraw
          </Button>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" letterSpacing={1.2}>
            Recent activity
          </Typography>
          <Stack spacing={1.25}>
            {activity.map((item) => (
              <Box key={item.id} display="flex" alignItems="center" justifyContent="space-between" gap={1.5}>
                <Stack direction="row" spacing={1.5} alignItems="center" flexGrow={1} minWidth={0}>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1.5,
                      width: 36,
                      height: 36,
                      bgcolor: item.type === "credit" ? "rgba(17,17,17,0.08)" : "rgba(17,17,17,0.04)",
                    }}
                  >
                    <span
                      className="material-symbols-rounded"
                      style={{
                        color: item.type === "credit" ? "#111111" : "rgba(17,17,17,0.56)",
                      }}
                    >
                      {item.type === "credit" ? "trending_up" : "trending_down"}
                    </span>
                  </Box>
                  <Stack minWidth={0} spacing={0.25}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {item.timestamp}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="body2" fontWeight={700} color={item.type === "credit" ? "text.primary" : "text.secondary"}>
                  {item.amount}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Divider sx={{ borderStyle: "dashed" }} />
          <Typography variant="caption" color="text.secondary">
            Track and manage testimonies-backed loans from your Fleak wallet.
          </Typography>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
