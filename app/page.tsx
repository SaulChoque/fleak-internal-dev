"use client";

import { useEffect, useMemo, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
/* Fallback stub for @coinbase/onchainkit/minikit when the package or its types
   are not installed locally. Replace with the real import once the package is added:
   import { useMiniKit } from "@coinbase/onchainkit/minikit";
*/
function useMiniKit() {
  return {
    setMiniAppReady: () => {},
    isMiniAppReady: true,
  };
}
import styles from "./page.module.css";
import { BottomNav, BottomNavKey } from "@/app/components/navigation/BottomNav";
import { TopBar } from "@/app/components/navigation/TopBar";
import { TestimoniesView } from "@/app/features/testimonies/TestimoniesView";
import { FriendsView } from "@/app/features/friends/FriendsView";
import { FinanceView } from "@/app/features/finance/FinanceView";
import { AccountView } from "@/app/features/account/AccountView";
import { HomeView } from "@/app/features/home/HomeView";

const topBarConfig: Record<BottomNavKey, { title: string; subtitle?: string; actions?: { icon: string; ariaLabel: string }[] }> = {
  home: {
    title: "Welcome back, Baluchop",
    actions: [
      { icon: "notifications", ariaLabel: "Open notifications" },
      { icon: "account_circle", ariaLabel: "Open profile" },
    ],
  },
  testimonies: {
    title: "My Testimonies",
    subtitle: "Pending of revision",
  },
  friends: {
    title: "My Friends",
    subtitle: "Pending requests",
  },
  finance: {
    title: "My finances",
    subtitle: "Recent activity",
  },
  account: {
    title: "Account Information",
    actions: [{ icon: "share", ariaLabel: "Share account" }],
  },
};

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const [active, setActive] = useState<BottomNavKey>("home");

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  useEffect(() => {
    console.log("useEffect to signal miniapp readiness triggered");
    const signalReady = async () => {
      try {
        console.log("Notifying Base app that miniapp is ready");
        await sdk.actions.ready();
      } catch (error) {
        console.error("Failed to notify Base app readiness", error);
      }
    };

    void signalReady();
  }, []);

  const config = topBarConfig[active];

  const view = useMemo(() => {
    switch (active) {
      case "home":
        return <HomeView />;
      case "friends":
        return <FriendsView />;
      case "finance":
        return <FinanceView />;
      case "account":
        return <AccountView />;
      default:
        return <TestimoniesView />;
    }
  }, [active]);

  return (
    <div className={styles.screen}>
      <div className={styles.shell}>
        <TopBar title={config.title} subtitle={config.subtitle} actions={config.actions} />
        <main className={styles.mainContent}>{view}</main>
      </div>
      <div className={styles.bottomNavWrapper}>
        <BottomNav active={active} onChange={setActive} />
      </div>
    </div>
  );
}
