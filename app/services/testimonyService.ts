import { TestimoniesDataset, Testimony } from "@/app/types/testimony";

export const TestimonyService = {
  async getDataset(): Promise<TestimoniesDataset> {
    try {
      // TODO: Implement real testimonies/attestations endpoint
      // This would fetch from attestations endpoints when available
      
      const response = await fetch('/api/attestations/user-dataset', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If endpoint doesn't exist yet, fall back to mock data
        if (response.status === 404) {
          console.warn('Testimonies dataset endpoint not implemented yet, using mock data');
          const { testimoniesDataset } = await import('@/app/mocks/testimonies');
          return testimoniesDataset;
        }
        
        if (response.status === 401) {
          throw new Error('No autenticado. Por favor, inicia sesión.');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const dataset = await response.json();
      
      // Transform backend attestations data to frontend TestimoniesDataset
      // TODO: Update when backend provides attestations/testimonies endpoints
      return dataset || {
        highlightCard: null,
        pendingReview: [],
        invitations: [],
        recentActivity: [],
      };
    } catch (error) {
      console.error('TestimonyService.getDataset error:', error);
      
      // Fallback to mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to mock data due to API error');
        const { testimoniesDataset } = await import('@/app/mocks/testimonies');
        return testimoniesDataset;
      }
      
      throw error;
    }
  },

  async getById(id: string): Promise<Testimony | undefined> {
    try {
      const dataset = await this.getDataset();
      const { pendingReview, invitations, recentActivity } = dataset;
      return [...pendingReview, ...invitations, ...recentActivity].find((item) => item.id === id);
    } catch (error) {
      console.error('TestimonyService.getById error:', error);
      
      // Fallback to mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to mock data due to API error');
        const { testimoniesDataset } = await import('@/app/mocks/testimonies');
        const { pendingReview, invitations, recentActivity } = testimoniesDataset;
        return [...pendingReview, ...invitations, ...recentActivity].find((item) => item.id === id);
      }
      
      throw error;
    }
  },
};
