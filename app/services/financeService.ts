import { FinanceActivity, FinanceBalance } from "@/app/types/finance";

export const FinanceService = {
  async getBalance(): Promise<FinanceBalance> {
    try {
      const response = await fetch('/api/finance/summary', {
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

      const snapshot = await response.json();
      
      // Transform backend FinanceSnapshot to frontend FinanceBalance
      return {
        currency: "USDC",
        amount: snapshot.totalEscrowed || 0,
        formatted: `${snapshot.totalEscrowed || 0} USDC`,
        address: "wallet-address", // TODO: Get from user context/wallet
      };
    } catch (error) {
      console.error('FinanceService.getBalance error:', error);
      
      // Fallback to mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to mock data due to API error');
        const { financeBalanceMock } = await import('@/app/mocks/finance');
        return financeBalanceMock;
      }
      
      throw error;
    }
  },

  async listActivity(): Promise<FinanceActivity[]> {
    try {
      const response = await fetch('/api/finance/summary', {
        method: 'GET',
        credentials: 'include',
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

      const snapshot = await response.json();
      
      // Transform backend recentActivity to frontend FinanceActivity
      return snapshot.recentActivity?.map((activity: { type: string; occurredAt: string; amount: number }, index: number) => ({
        id: `activity-${index}`,
        title: activity.type === 'deposit' ? 'Depósito' : 
               activity.type === 'payout' ? 'Pago recibido' : 'Reembolso',
        timestamp: new Date(activity.occurredAt).toLocaleDateString('es-ES'),
        type: activity.amount > 0 ? 'credit' : 'debit',
        amount: `${activity.amount > 0 ? '+' : ''}${activity.amount} USDC`,
      })) || [];
    } catch (error) {
      console.error('FinanceService.listActivity error:', error);
      
      // Fallback to mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to mock data due to API error');
        const { financeActivitiesMock } = await import('@/app/mocks/finance');
        return financeActivitiesMock;
      }
      
      throw error;
    }
  },
};
