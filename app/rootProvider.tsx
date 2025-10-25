"use client";
import { sdk } from "@farcaster/miniapp-sdk";
import { ReactNode, useEffect } from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#027cda", contrastText: "#ffffff" },
    secondary: { main: "#023682", contrastText: "#ffffff" },
    background: { default: "#ffffff", paper: "#e7ecef" },
    text: {
      primary: "#111111",
      secondary: "#4d628e",
    },
    info: { main: "#41ecfe" },
    divider: "rgba(2, 54, 130, 0.16)",
  },
  shape: {
    borderRadius: 24,
  },
  typography: {
    fontFamily: "var(--font-inter), sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: "1.25rem",
          fontWeight: 600,
        },
        containedPrimary: {
          boxShadow: "0 12px 24px rgba(2, 124, 218, 0.3)",
        },
        textSecondary: {
          color: "#023682",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: "0px 24px 60px rgba(3, 27, 78, 0.1)",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: 0.4,
        },
      },
    },
  },
});

export function RootProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    console.info(">>>>>>>>>>>>>>>Notifying host that mini app is ready");
    // Notify the host that the mini app is ready.
    // Call directly per Farcaster miniapp SDK usage pattern.
    sdk.actions.ready();
  }, []);

  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
        },
        wallet: {
          display: "modal",
          preference: "all",
        },
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
    >
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline enableColorScheme />
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </OnchainKitProvider>
  );
}
