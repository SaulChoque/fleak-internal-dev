import { sdk } from "@farcaster/miniapp-sdk";
import { AccountAction, AccountInfo } from "@/app/types/account";

type MiniAppContextSubset = {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  location?: {
    description?: string;
  };
  client?: {
    platformType?: 'web' | 'mobile';
    added?: boolean;
  };
};

const resolveClientBadge = (platformType?: "web" | "mobile", added?: boolean): string | undefined => {
  if (!platformType) {
    return undefined;
  }

  const platformLabel = platformType === "mobile" ? "Base mobile client" : "Base web client";
  if (added) {
    return `Pinned in ${platformLabel}`;
  }

  return `Using ${platformLabel}`;
};

export const AccountService = {
  async getInfo(): Promise<AccountInfo> {
    try {
      const response = await fetch("/api/account/summary", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Not authenticated. Please sign in again.");
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const summary = await response.json();

      const invitationDate = summary.createdAt ? new Date(summary.createdAt) : undefined;
      const streakLabel = summary.streakCount > 0 ? `${summary.streakCount} day${summary.streakCount === 1 ? "" : "s"} streak` : "No active streak";

      const account: AccountInfo = {
        id: summary.fid,
        displayName: summary.displayName ?? `User ${summary.fid}`,
        username: summary.username ?? `@${summary.fid}`,
        dateOfInvitation: invitationDate
          ? invitationDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
          : "Pending",
        chain: "Base Sepolia",
        totalTransacted: summary.walletAddress ? "Wallet connected" : "Wallet pending",
        generalScore: `${summary.resolvedFlakes} resolved / ${summary.openFlakes} active`,
        location: "Mini-app",
        numberOfFriends: summary.friends.length,
        goalsAchieved: summary.resolvedFlakes,
        favoriteFriend: summary.friends.length > 0 ? summary.friends[0] : "None yet",
        streak: streakLabel,
      };

      try {
        const isMiniApp = await sdk.isInMiniApp();
        if (isMiniApp) {
          const context = (await sdk.context) as MiniAppContextSubset;

          if (context.user) {
            const { fid, username, displayName, pfpUrl } = context.user;
            account.id = fid ? String(fid) : account.id;
            if (displayName) {
              account.displayName = displayName;
            }
            if (username) {
              account.username = username.startsWith("@") ? username : `@${username}`;
            }
            if (pfpUrl) {
              account.avatarUrl = pfpUrl;
            }
          }

          const contextLocation = context.location;
          if (contextLocation?.description) {
            account.location = contextLocation.description;
          }

          const client = context.client;
          if (client) {
            account.badgeLabel = resolveClientBadge(client.platformType, client.added);
          }
        }
      } catch (contextError) {
        console.debug('Mini app context unavailable', contextError);
      }

      return account;
    } catch (error) {
      console.error("AccountService.getInfo error:", error);

      if (process.env.NODE_ENV === "development") {
        console.warn("Falling back to mock data due to API error");
        const { accountInfoMock } = await import("@/app/mocks/account");
        return accountInfoMock;
      }
      
      throw error;
    }
  },

  async listActions(): Promise<AccountAction[]> {
    try {
      return [
        { id: "share-profile", label: "Share profile", icon: "share" },
        { id: "logout", label: "Log out", icon: "logout" },
        { id: "delete-account", label: "Delete account", icon: "delete", variant: "danger" },
      ];
    } catch (error) {
      console.error("AccountService.listActions error:", error);

      if (process.env.NODE_ENV === "development") {
        const { accountActionsMock } = await import("@/app/mocks/account");
        return accountActionsMock;
      }
      
      throw error;
    }
  },

  async logout(): Promise<void> {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const message = "Unable to sign out right now. Please try again.";
      throw new Error(message);
    }
  },
};
