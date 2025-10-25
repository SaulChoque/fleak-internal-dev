import { HomeActivity } from "@/app/types/home";

export const HomeService = {
  async listActivities(): Promise<HomeActivity[]> {
    try {
      // TODO: Implement real activities endpoint when available
      // For now, this would fetch from a flakes/activities endpoint
      // that returns user's recent flakes/activities
      
      const response = await fetch('/api/flakes/user-activities', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If endpoint doesn't exist yet, fall back to mock data
        if (response.status === 404) {
          console.warn('Activities endpoint not implemented yet, using mock data');
          const { homeActivitiesMock } = await import('@/app/mocks/home');
          return homeActivitiesMock;
        }
        
        if (response.status === 401) {
          throw new Error('No autenticado. Por favor, inicia sesión.');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const activitiesData = await response.json();
      
      // Transform backend activities data to frontend HomeActivity type
      // TODO: Update when backend provides activities/flakes endpoint
      return activitiesData || [];
    } catch (error) {
      console.error('HomeService.listActivities error:', error);
      
      // Fallback to mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to mock data due to API error');
        const { homeActivitiesMock } = await import('@/app/mocks/home');
        return homeActivitiesMock;
      }
      
      throw error;
    }
  },
};
