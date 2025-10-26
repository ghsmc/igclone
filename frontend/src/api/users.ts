import { apiClient } from './client';

export const usersApi = {
  getUserProfile: async (username: string) => {
    const response = await apiClient.get(`/users/${username}`);
    return response.data;
  },

  updateProfile: async (data: {
    fullName?: string;
    bio?: string;
    website?: string;
    avatar?: string;
  }) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  searchUsers: async (query: string) => {
    const response = await apiClient.get(`/users/search?q=${query}`);
    return response.data;
  },

  followUser: async (userId: string) => {
    const response = await apiClient.post(`/follow/${userId}`);
    return response.data;
  },

  unfollowUser: async (userId: string) => {
    const response = await apiClient.delete(`/follow/${userId}`);
    return response.data;
  },

  getFollowers: async (username: string) => {
    const response = await apiClient.get(`/follow/followers/${username}`);
    return response.data;
  },

  getFollowing: async (username: string) => {
    const response = await apiClient.get(`/follow/following/${username}`);
    return response.data;
  },
};
