import { apiClient } from './client';
import { Post } from '../types';

export const postsApi = {
  getFeed: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/posts/feed?page=${page}&limit=${limit}`);
    return response.data;
  },

  getPost: async (postId: string) => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  },

  getUserPosts: async (username: string) => {
    const response = await apiClient.get(`/posts/user/${username}`);
    return response.data;
  },

  createPost: async (formData: FormData) => {
    const response = await apiClient.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePost: async (postId: string) => {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  },

  likePost: async (postId: string) => {
    const response = await apiClient.post(`/likes/${postId}`);
    return response.data;
  },

  unlikePost: async (postId: string) => {
    const response = await apiClient.delete(`/likes/${postId}`);
    return response.data;
  },

  createComment: async (postId: string, text: string) => {
    const response = await apiClient.post(`/comments/${postId}`, { text });
    return response.data;
  },

  getComments: async (postId: string) => {
    const response = await apiClient.get(`/comments/${postId}`);
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  },
};
