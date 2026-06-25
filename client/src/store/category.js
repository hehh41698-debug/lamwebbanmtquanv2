import { defineStore } from 'pinia';
import api from '../api/auth';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
    error: null
  }),

  getters: {
    getCategoryById: (state) => (id) => {
      return state.categories.find(c => c._id === id);
    },
    getCategoryBySlug: (state) => (slug) => {
      return state.categories.find(c => c.slug === slug);
    }
  },

  actions: {
    // Lấy danh sách danh mục
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/categories');
        this.categories = response.data.categories || [];
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch categories';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Tạo danh mục (admin)
    async createCategory(data) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/categories', data);
        this.categories.push(response.data.category);
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create category';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Cập nhật danh mục (admin)
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
        this.error = error.response?.data?.message || 'Failed to update category';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Xóa danh mục (admin)
    async deleteCategory(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.delete(`/categories/${id}`);
        this.categories = this.categories.filter(c => c._id !== id);
        return { success: true };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete category';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    }
  }
});