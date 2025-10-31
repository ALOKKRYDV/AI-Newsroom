import { create } from 'zustand';
import api from '../utils/api';

export const useArticleStore = create((set, get) => ({
  articles: [],
  currentArticle: null,
  loading: false,
  pagination: null,

  fetchArticles: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/articles', { params });
      set({ articles: data.articles, pagination: data.pagination, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Failed to fetch articles:', error);
    }
  },

  fetchArticle: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get(`/articles/${id}`);
      set({ currentArticle: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      console.error('Failed to fetch article:', error);
    }
  },

  createArticle: async (articleData) => {
    try {
      const { data } = await api.post('/articles', articleData);
      set({ articles: [data, ...get().articles] });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error };
    }
  },

  updateArticle: async (id, updates) => {
    try {
      const { data } = await api.patch(`/articles/${id}`, updates);
      set({ currentArticle: data });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error };
    }
  },

  deleteArticle: async (id) => {
    try {
      await api.delete(`/articles/${id}`);
      set({ articles: get().articles.filter(a => a.id !== id) });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error };
    }
  },

  subscribeToArticle: (articleId, callback) => {
    const eventSource = new EventSource(`/api/articles/stream/${articleId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }
}));
