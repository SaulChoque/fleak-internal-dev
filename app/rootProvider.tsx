"use client";
import { ReactNode, useEffect } from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { sdk } from "@farcaster/miniapp-sdk";
import "@coinbase/onchainkit/styles.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#111111" },
    secondary: { main: "#f5f5f5" },
    background: { default: "#f5f5f5", paper: "#ffffff" },
    text: {
      primary: "#111111",
      secondary: "rgba(0, 0, 0, 0.6)",
    },
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
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.08)",
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
  },
});

export function RootProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const signalReady = async () => {
      try {
        console.info("Notifying Base app readiness...");
        await sdk.actions.ready();
      } catch (error) {
        console.error("Failed to notify Base app readiness", error);
      }
    };

    void signalReady();
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
