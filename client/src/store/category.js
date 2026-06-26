import { defineStore } from 'pinia';
import api from '../api/auth';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  }),

  getters: {
    getCategoryById: (state) => (id) => {
      return state.categories.find(c => c._id === id);
    },
    getCategoryBySlug: (state) => (slug) => {
      return state.categories.find(c => c.slug === slug);
    },
    categoryCount: (state) => state.categories.length
  },

  actions: {
    // Lấy danh sách danh mục
    async fetchCategories(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        
        const response = await api.get(`/categories?${queryParams.toString()}`);
        this.categories = response.data.categories || [];
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Fetch categories error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch categories';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Tạo danh mục mới
    async createCategory(data) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/categories', data);
        this.categories.unshift(response.data.category);
        this.pagination.total += 1;
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Create category error:', error);
        this.error = error.response?.data?.message || 'Failed to create category';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Cập nhật danh mục
    async updateCategory(id, data) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/categories/${id}`, data);
        const index = this.categories.findIndex(c => c._id === id);
        if (index !== -1) {
          this.categories[index] = response.data.category;
        }
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Update category error:', error);
        this.error = error.response?.data?.message || 'Failed to update category';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Xóa danh mục
    async deleteCategory(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.delete(`/categories/${id}`);
        this.categories = this.categories.filter(c => c._id !== id);
        this.pagination.total = Math.max(0, this.pagination.total - 1);
        return { success: true };
      } catch (error) {
        console.error('Delete category error:', error);
        this.error = error.response?.data?.message || 'Failed to delete category';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Reset state
    reset() {
      this.categories = [];
      this.loading = false;
      this.error = null;
      this.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      };
    }
  }
});