import { AccountAction, AccountInfo } from "@/app/types/account";

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
      
      // Transform backend AccountSummary to frontend AccountInfo
      return {
        id: summary.fid,
        displayName: `Usuario ${summary.fid}`, // TODO: Get real display name from user profile
        username: `@${summary.fid}`,
        dateOfInvitation: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        chain: "Base Sepolia",
        totalTransacted: summary.walletAddress ? "Conectado" : "Sin conectar",
        generalScore: `${summary.resolvedFlakes}/${summary.openFlakes}`,
        location: "Web App", // TODO: Get from geolocation if available
        numberOfFriends: summary.friends.length,
        goalsAchieved: summary.resolvedFlakes,
        favoriteFriend: summary.friends.length > 0 ? summary.friends[0] : "Ninguno",
        streak: `${summary.streakCount} días`,
      };
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
