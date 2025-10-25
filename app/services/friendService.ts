import { Friend, FriendRequest } from "@/app/types/friend";

export const FriendService = {
  async listFriends(): Promise<Friend[]> {
    try {
      const response = await fetch('/api/friends/overview', {
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

      const friendsData = await response.json();
      
      // Transform backend friends data to frontend Friend type
      // TODO: Update when backend provides full friend objects
      return friendsData.friends?.map((friendFid: string, index: number) => ({
        id: friendFid,
        displayName: `Amigo ${index + 1}`, // TODO: Get real display names
        username: `@${friendFid}`,
        isOnline: Math.random() > 0.5, // TODO: Get real online status
        profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendFid}`, // TODO: Get real profile images
      })) || [];
    } catch (error) {
      console.error('FriendService.listFriends error:', error);
      
      // Fallback to mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to mock data due to API error');
        const { friendsMock } = await import('@/app/mocks/friends');
        return friendsMock;
      }
      
      throw error;
    }
  },

  async listRequests(): Promise<FriendRequest[]> {
    try {
      const response = await fetch('/api/friends/overview', {
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

      const friendsData = await response.json();
      
      // Transform backend pending requests to frontend FriendRequest type
      // TODO: Update when backend provides pending friend requests
      return friendsData.pendingRequests?.map((request: { fromFid: string; timestamp: string }) => ({
        id: `request-${request.fromFid}`,
        fromUser: {
          id: request.fromFid,
          displayName: `Usuario ${request.fromFid}`,
          username: `@${request.fromFid}`,
          profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.fromFid}`,
        },
        timestamp: new Date(request.timestamp).toLocaleDateString('es-ES'),
        message: "Quiere ser tu amigo en Fleak",
      })) || [];
    } catch (error) {
      console.error('FriendService.listRequests error:', error);
      
      // Fallback to mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to mock data due to API error');
        const { friendRequestsMock } = await import('@/app/mocks/friends');
        return friendRequestsMock;
      }
      
      throw error;
    }
  },

  async listSuggestions(): Promise<Friend[]> {
    try {
      // TODO: Implement suggestions endpoint in backend
      // For now, return empty array since this is a "nice to have" feature
      return [];
    } catch (error) {
      console.error('FriendService.listSuggestions error:', error);
      
      // Fallback to mock data if API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to mock data due to API error');
        const { friendSuggestionsMock } = await import('@/app/mocks/friends');
        return friendSuggestionsMock;
      }
      
      throw error;
    }
  },
};
