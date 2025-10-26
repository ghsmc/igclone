import { apiClient } from './client';
import { AuthResponse } from '../types';

export const authApi = {
  signup: async (data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  login: async (data: {
    emailOrUsername: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
