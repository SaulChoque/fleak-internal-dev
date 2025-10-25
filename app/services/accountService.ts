import { sdk } from '@farcaster/miniapp-sdk';
import { AccountAction, AccountInfo } from '@/app/types/account';

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

const resolveClientBadge = (platformType?: 'web' | 'mobile', added?: boolean): string | undefined => {
  if (!platformType) {
    return undefined;
  }

  const platformLabel = platformType === 'mobile' ? 'Base mobile client' : 'Base web client';
  if (added) {
    return `Pinned in ${platformLabel}`;
  }

  return `Using ${platformLabel}`;
};

export const AccountService = {
  async getInfo(): Promise<AccountInfo> {
    try {
      const response = await fetch('/api/account/summary', {
        method: 'GET',
        credentials: 'include', // Include cookies for session
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autenticado. Por favor, inicia sesión.');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const summary = await response.json();

      const account: AccountInfo = {
        id: summary.fid,
        displayName: `Usuario ${summary.fid}`,
        username: `@${summary.fid}`,
        dateOfInvitation: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        chain: 'Base Sepolia',
        totalTransacted: summary.walletAddress ? 'Conectado' : 'Sin conectar',
        generalScore: `${summary.resolvedFlakes}/${summary.openFlakes}`,
        location: 'Web App',
        numberOfFriends: summary.friends.length,
        goalsAchieved: summary.resolvedFlakes,
        favoriteFriend: summary.friends.length > 0 ? summary.friends[0] : 'Ninguno',
        streak: `${summary.streakCount} días`,
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
              account.username = username.startsWith('@') ? username : `@${username}`;
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
      console.error('AccountService.getInfo error:', error);
      
      // Fallback to mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to mock data due to API error');
        const { accountInfoMock } = await import('@/app/mocks/account');
        return accountInfoMock;
      }
      
      throw error;
    }
  },

  async listActions(): Promise<AccountAction[]> {
    try {
      // For now, return static actions since they don't come from backend
      // TODO: Make this dynamic based on user permissions/status
      return [
        { id: "share-profile", label: "Compartir perfil", icon: "share" },
        { id: "logout", label: "Cerrar sesión", icon: "logout" },
        { id: "delete-account", label: "Eliminar cuenta", icon: "delete", variant: "danger" },
      ];
    } catch (error) {
      console.error('AccountService.listActions error:', error);
      
      // Fallback to mock data
      if (process.env.NODE_ENV === 'development') {
        const { accountActionsMock } = await import('@/app/mocks/account');
        return accountActionsMock;
      }
      
      throw error;
    }
  },
};
