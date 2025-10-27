import { UserProfile } from '@/models/User';

const API_URL = `${process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000'}/api`;

// Helper function to get auth token from AsyncStorage
const getAuthToken = async (): Promise<string | null> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Simple GET request
const getRequest = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

// Authenticated GET request
const getAuthenticatedRequest = async <T>(endpoint: string): Promise<T> => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Authenticated GET request failed:', error);
    throw error;
  }
};

// Authenticated POST request
const postAuthenticatedRequest = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Authenticated POST request failed:', error);
    throw error;
  }
};

// Authenticated PUT request
const putAuthenticatedRequest = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Authenticated PUT request failed:', error);
    throw error;
  }
};

// Authenticated DELETE request
const deleteAuthenticatedRequest = async <T>(endpoint: string): Promise<T> => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Authenticated DELETE request failed:', error);
    throw error;
  }
};

export const userService = {
  // Get user profile
  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      console.log('👤 Getting user profile...');
      return await getAuthenticatedRequest<UserProfile>('/users/profile');
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      console.log('📝 Updating user profile...', profileData);
      return await putAuthenticatedRequest<UserProfile>('/users/profile', profileData);
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      return null;
    }
  },

  // Get user statistics
  getUserStats: async (): Promise<any> => {
    try {
      console.log('📊 Getting user statistics...');
      return await getAuthenticatedRequest('/users/stats');
    } catch (error) {
      console.error('❌ Error getting user statistics:', error);
      return null;
    }
  },

  // Update user statistics
  updateUserStats: async (stats: any): Promise<any> => {
    try {
      console.log('📊 Updating user statistics...', stats);
      return await putAuthenticatedRequest('/users/stats', stats);
    } catch (error) {
      console.error('❌ Error updating user statistics:', error);
      return null;
    }
  },

  // Get user posts
  getUserPosts: async (): Promise<any[]> => {
    try {
      console.log('📝 Getting user posts...');
      return await getAuthenticatedRequest('/users/posts');
    } catch (error) {
      console.error('❌ Error getting user posts:', error);
      return [];
    }
  },

  // Delete user account
  deleteUserAccount: async (): Promise<boolean> => {
    try {
      console.log('🗑️ Deleting user account...');
      await deleteAuthenticatedRequest('/users/account');
      return true;
    } catch (error) {
      console.error('❌ Error deleting user account:', error);
      return false;
    }
  }
};